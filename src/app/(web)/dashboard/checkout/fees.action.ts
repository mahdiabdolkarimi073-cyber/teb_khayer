'use server'

import { getVar } from "@backend/utils/setting";
import { getProductsShipping, ProductShippingConfig } from "@/app/(web)/admin/products/shipping.action";

export async function getCheckoutFees(productIds?: string[]) {
	const [
		boxFee,
		postFee,
		cashOnDeliveryEnabled,
		freeShippingThreshold,
		deliveryEstimatedDays,
		unifiedShippingEnabled,
		unifiedShippingFee,
		unifiedShippingDiscount
	] = await Promise.all([
		getVar<string>("PRODUCT_BOX_FEE"),
		getVar<string>("PRODUCT_POST_FEE"),
		getVar<string>("CASH_ON_DELIVERY_ENABLED"),
		getVar<string>("FREE_SHIPPING_THRESHOLD"),
		getVar<string>("DELIVERY_ESTIMATED_DAYS"),
		getVar<string>("UNIFIED_SHIPPING_ENABLED"),
		getVar<string>("UNIFIED_SHIPPING_FEE"),
		getVar<string>("UNIFIED_SHIPPING_DISCOUNT"),
	]);

	let productShippingConfigs: Record<string, ProductShippingConfig> = {};
	if (productIds && productIds.length > 0) {
		try {
			productShippingConfigs = await getProductsShipping(productIds);
		} catch (err) {
			console.warn("Failed to fetch product shipping configs in fees.action:", err);
		}
	}

	return {
		boxFee: boxFee || "0",
		postFee: postFee || "36000",
		cashOnDeliveryEnabled: cashOnDeliveryEnabled === "true",
		freeShippingThreshold: Number(freeShippingThreshold || 2000000),
		deliveryEstimatedDays: deliveryEstimatedDays || "۳ تا ۵ روز کاری",
		unifiedShipping: {
			enabled: unifiedShippingEnabled === "true",
			fee: Number(unifiedShippingFee || 39000),
			discount: Number(unifiedShippingDiscount || 0),
		},
		productShippingConfigs,
	};
}
