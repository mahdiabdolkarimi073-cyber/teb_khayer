'use server'

import prisma from "@backend/modules/prisma/Prisma";
import { getVar } from "@backend/utils/setting";
import { ssrOptimize } from "@/utils/other";

export async function getCartFees() {
	const [boxFee, postFee, freeShippingThreshold] = await Promise.all([
		getVar<string>("PRODUCT_BOX_FEE"),
		getVar<string>("PRODUCT_POST_FEE"),
		getVar<string>("FREE_SHIPPING_THRESHOLD", "2000000"),
	]);
	return {
		boxFee,
		postFee,
		freeShippingThreshold: Number(freeShippingThreshold || 2000000),
	};
}

export async function getEmptyCartRecommendations() {
	const [popularCategories, bestSellingProducts] = await Promise.all([
		prisma.productCategory.findMany({
			include: {
				_count: {
					select: { products: true },
				},
			},
			take: 6,
			orderBy: {
				created_at: "asc",
			},
		}),
		prisma.product.findMany({
			where: {
				stock: { gt: 0 },
			},
			include: {
				category: true,
			},
			take: 8,
			orderBy: [
				{ isBestSeller: "desc" },
				{ isSpecial: "desc" },
				{ created_at: "desc" },
			],
		}),
	]);

	return ssrOptimize({
		popularCategories,
		bestSellingProducts,
	});
}
