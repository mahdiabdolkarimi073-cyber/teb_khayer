'use server'


import prisma from "@backend/modules/prisma/Prisma";

export type SortOption = "new" | "priceLow" | "priceHigh" | "bestSeller" | "discount" | "special";

export async function getAllProductCount(search: undefined | string = undefined, filter?: SortOption) {
	return await prisma.product.count({
		where: {
			...(search && ({
				OR: [
					{
						name: {
							contains: search
						}
					},
					{
						description_text: {
							contains: search
						}
					}
				]
			})),
			...(filter === "bestSeller" && { isBestSeller: true }),
			...(filter === "special" && { isSpecial: true }),
			...(filter === "discount" && { discountPercent: { gt: 0 } }),
		}
	});
}

export async function getProducts(skip = 0, search: string | undefined = undefined, take?: number, sort?: SortOption) {
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
		take: take || 10,
		skip,
		where: {
			...(search && ({
				OR: [
					{
						name: {
							contains: search
						}
					},
					{
						description_text: {
							contains: search
						}
					}
				]
			})),
			...(sort === "bestSeller" && { isBestSeller: true }),
			...(sort === "special" && { isSpecial: true }),
			...(sort === "discount" && { discountPercent: { gt: 0 } }),
		},
		orderBy
	})
}
