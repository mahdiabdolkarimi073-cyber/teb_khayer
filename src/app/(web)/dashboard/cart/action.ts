'use server'

import { getVar } from "@backend/utils/setting";

export async function getCartFees() {
	const [boxFee, postFee, freeShippingThreshold] = await Promise.all([
		getVar<string>("PRODUCT_BOX_FEE"),
		getVar<string>("PRODUCT_POST_FEE"),
		getVar<string>("FREE_SHIPPING_THRESHOLD"),
	]);
	return {
		boxFee,
		postFee,
		freeShippingThreshold: Number(freeShippingThreshold || 0),
	};
}
