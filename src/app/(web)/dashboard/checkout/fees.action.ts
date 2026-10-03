'use server'

import { getVar } from "@backend/utils/setting";

export async function getCheckoutFees() {
	const [boxFee, postFee, cashOnDeliveryEnabled] = await Promise.all([
		getVar<string>("PRODUCT_BOX_FEE"),
		getVar<string>("PRODUCT_POST_FEE"),
		getVar<string>("CASH_ON_DELIVERY_ENABLED"),
	]);
	return { boxFee, postFee, cashOnDeliveryEnabled: cashOnDeliveryEnabled === "true" };
}
