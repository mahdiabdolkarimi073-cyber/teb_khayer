export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "@backend/modules/prisma/Prisma";
import { getVar } from "@backend/utils/setting";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";

export async function GET(req: NextRequest) {
	const torobEnabled = await getVar<string>('TOROB_ENABLED');
	if (torobEnabled !== "true") {
		return NextResponse.json({ error: "Torob feed is disabled" }, { status: 403 });
	}

	const baseUrl = (await getVar<string>('TRUST_WEBSITE')) || SettingKeyInfo["TRUST_WEBSITE"]?.default || "https://teb-khayyer.ir";

	const products = await prisma.product.findMany({
		include: {
			category: true,
		},
	});

	const feed = {
		products: products.map((p) => ({
			id: p.id,
			title: p.name,
			price: p.price,
			old_price: p.originalPrice || null,
			discount: p.discountPercent > 0 ? p.discountPercent : null,
			url: `${baseUrl}/product/${p.id}`,
			availability: p.stock > 0 ? "in stock" : "out of stock",
			image: p.images?.[0] ? `${baseUrl}${p.images[0]}` : null,
			category: p.category?.name || "",
			description: p.description_text || "",
		})),
	};

	return NextResponse.json(feed, {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
