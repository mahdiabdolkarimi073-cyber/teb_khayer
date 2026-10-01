'use server'

import { getVar } from "@backend/utils/setting";

export async function getCartFees() {
	const [boxFee, postFee] = await Promise.all([
		getVar<string>("PRODUCT_BOX_FEE"),
		getVar<string>("PRODUCT_POST_FEE"),
	]);
	return { boxFee, postFee };
}
