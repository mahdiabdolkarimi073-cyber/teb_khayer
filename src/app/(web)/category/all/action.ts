'use server'

import prisma from "@backend/modules/prisma/Prisma";
import { Product } from "@prisma/client";

export type SortOption = "new" | "priceLow" | "priceHigh" | "bestSeller" | "discount" | "special";

/**
 * Normalizes Persian and Arabic text for reliable, tolerant searching
 */
export async function normalizePersianText(str: string): Promise<string> {
	if (!str) return "";
	return str
		.replace(/[\u064B-\u065F\u0670]/g, "") // Arabic diacritics (Harakat)
		.replace(/\u064A/g, "\u06CC") // Arabic yeh (ي) -> Persian ye (ی)
		.replace(/\u0649/g, "\u06CC") // Alef maksura (ى) -> Persian ye (ی)
		.replace(/\u0643/g, "\u06A9") // Arabic kaf (ك) -> Persian kaf (ک)
		.replace(/[\u0622\u0623\u0625]/g, "\u0627") // Alef variants (آ, أ, إ) -> ا
		.replace(/\u06C0/g, "\u0647") // Heh with yeh
		.replace(/[\u200B\u200C\u200D\uFEFF]/g, " ") // Zero-width spaces -> space
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();
}

/**
 * Synchronous in-memory normalization helper
 */
function normalizeString(str: string): string {
	if (!str) return "";
	return str
		.replace(/[\u064B-\u065F\u0670]/g, "")
		.replace(/\u064A/g, "\u06CC")
		.replace(/\u0649/g, "\u06CC")
		.replace(/\u0643/g, "\u06A9")
		.replace(/[\u0622\u0623\u0625]/g, "\u0627")
		.replace(/\u06C0/g, "\u0647")
		.replace(/[\u200B\u200C\u200D\uFEFF]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();
}

/**
 * Generates search conditions matching EXCLUSIVELY on product name
 */
function buildNameOnlySearchWhere(search: string | undefined) {
	if (!search || !search.trim()) return {};
	const raw = search.trim();
	const normalizedPersian = normalizeString(raw);
	// Also build Arabic character variation
	const arabicVariation = normalizedPersian
		.replace(/\u06CC/g, "\u064A")
		.replace(/\u06A9/g, "\u0643");

	const tokens = normalizedPersian.split(" ").filter((t) => t.length > 1);

	const nameConditions: any[] = [
		{ name: { contains: raw, mode: "insensitive" } },
		{ name: { contains: normalizedPersian, mode: "insensitive" } },
		{ name: { contains: arabicVariation, mode: "insensitive" } },
	];

	for (const token of tokens) {
		nameConditions.push({ name: { contains: token, mode: "insensitive" } });
		nameConditions.push({
			name: {
				contains: token.replace(/\u06CC/g, "\u064A").replace(/\u06A9/g, "\u0643"),
				mode: "insensitive",
			},
		});
	}

	return {
		OR: nameConditions,
	};
}

export async function getAllProductCount(search: undefined | string = undefined, filter?: SortOption) {
	const whereConditions: any = {
		...buildNameOnlySearchWhere(search),
		...(filter === "bestSeller" && { isBestSeller: true }),
		...(filter === "special" && { isSpecial: true }),
		...(filter === "discount" && { discountPercent: { gt: 0 } }),
	};

	return await prisma.product.count({
		where: whereConditions,
	});
}

export async function getProducts(skip = 0, search: string | undefined = undefined, take = 20, sort?: SortOption) {
	const cleanSearch = typeof search === "string" ? search.trim() : undefined;
	const nameWhere = buildNameOnlySearchWhere(cleanSearch);

	const whereConditions: any = {
		...nameWhere,
		...(sort === "bestSeller" && { isBestSeller: true }),
		...(sort === "special" && { isSpecial: true }),
		...(sort === "discount" && { discountPercent: { gt: 0 } }),
	};

	// If no search is active, do normal DB pagination
	if (!cleanSearch) {
		const orderBy: any = (() => {
			switch (sort) {
				case "priceLow": return { price: "asc" as const };
				case "priceHigh": return { price: "desc" as const };
				case "bestSeller": return [{ isBestSeller: "desc" as const }, { created_at: "desc" as const }];
				case "discount": return [{ discountPercent: "desc" as const }, { created_at: "desc" as const }];
				case "special": return [{ isSpecial: "desc" as const }, { created_at: "desc" as const }];
				default: return { created_at: "desc" as const };
			}
		})();

		return await prisma.product.findMany({
			take,
			skip,
			where: whereConditions,
			orderBy,
		});
	}

	// When searching by name: fetch candidates matching name criteria
	// and rank them strictly on name match relevance
	const candidates = await prisma.product.findMany({
		where: whereConditions,
		take: 100, // sample sufficient candidate pool for smart scoring
	});

	const normQuery = normalizeString(cleanSearch);
	const queryTokens = normQuery.split(" ").filter(Boolean);

	const scored = candidates.map((product) => {
		const normName = normalizeString(product.name);
		let score = 0;

		if (normName === normQuery) {
			score = 1000; // Perfect match
		} else if (normName.startsWith(normQuery)) {
			score = 800; // Prefix match
		} else {
			let tokenMatches = 0;
			for (const t of queryTokens) {
				if (normName.includes(t)) {
					tokenMatches++;
				}
			}
			if (tokenMatches === queryTokens.length && queryTokens.length > 0) {
				score = 600 + tokenMatches * 20; // Contains all words in name
			} else if (normName.includes(normQuery)) {
				score = 500; // Substring match
			} else if (tokenMatches > 0) {
				score = 200 + tokenMatches * 30; // Partial word match
			}
		}

		return { product, score };
	});

	// Sort scored items primarily by match score
	scored.sort((a, b) => {
		if (b.score !== a.score) {
			return b.score - a.score;
		}
		// Secondary sort
		if (sort === "priceLow") return a.product.price - b.product.price;
		if (sort === "priceHigh") return b.product.price - a.product.price;
		if (sort === "bestSeller") return (b.product.isBestSeller ? 1 : 0) - (a.product.isBestSeller ? 1 : 0);
		if (sort === "discount") return (b.product.discountPercent || 0) - (a.product.discountPercent || 0);
		return new Date(b.product.created_at).getTime() - new Date(a.product.created_at).getTime();
	});

	// Slice page
	const pageItems = scored.slice(skip, skip + take).map((s) => s.product);
	return pageItems;
}

/**
 * Fast live search endpoint for instant keystroke results
 */
export async function searchProductsLive(query: string, limit = 8): Promise<Product[]> {
	if (!query || !query.trim()) return [];
	return await getProducts(0, query.trim(), limit);
}
