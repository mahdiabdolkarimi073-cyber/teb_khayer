'use server'

import { getVar } from "@backend/utils/setting";

export async function getCheckoutFees() {
	const [boxFee, postFee, cashOnDeliveryEnabled, freeShippingThreshold] = await Promise.all([
		getVar<string>("PRODUCT_BOX_FEE"),
		getVar<string>("PRODUCT_POST_FEE"),
		getVar<string>("CASH_ON_DELIVERY_ENABLED"),
		getVar<string>("FREE_SHIPPING_THRESHOLD"),
	]);
	return {
		boxFee,
		postFee,
		cashOnDeliveryEnabled: cashOnDeliveryEnabled === "true",
		freeShippingThreshold: Number(freeShippingThreshold || 0),
	};
}
