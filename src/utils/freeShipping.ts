import { Product } from "@prisma/client";

export type CartItem = {
	product: Partial<Product>;
	quantity: number;
};

export type CartListType = {
	[key: string]: CartItem;
};

/**
 * Determines whether an order qualifies for free shipping based on:
 * 1. Per-product freeShipping flag (any item in cart with freeShipping=true)
 * 2. Cart total meeting or exceeding the configured threshold
 */
export function isFreeShipping(
	items: CartItem[],
	threshold: number
): boolean {
	if (items.length === 0) return false;
	const hasFreeShippingProduct = items.some(
		(item) => !!item.product.freeShipping
	);
	if (hasFreeShippingProduct) return true;

	const productsTotal = items.reduce(
		(sum, item) => sum + Number(item.product.price || 0) * item.quantity,
		0
	);
	return threshold > 0 && productsTotal >= threshold;
}

/**
 * Returns the remaining amount needed to reach the free shipping threshold.
 * Returns 0 if already qualified.
 */
export function remainingForFreeShipping(
	items: CartItem[],
	threshold: number
): number {
	if (threshold <= 0) return 0;
	const productsTotal = items.reduce(
		(sum, item) => sum + Number(item.product.price || 0) * item.quantity,
		0
	);
	return Math.max(0, threshold - productsTotal);
}

/**
 * Whether a specific product in the cart should show the free shipping badge.
 * A product shows the badge if it has freeShipping flag OR if the whole cart
 * qualifies for free shipping by reaching the threshold.
 */
export function productShowsFreeBadge(
	item: CartItem,
	items: CartItem[],
	threshold: number
): boolean {
	if (!!item.product.freeShipping) return true;
	return threshold > 0 && cartTotal(items) >= threshold;
}

export function cartTotal(items: CartItem[]): number {
	return items.reduce(
		(sum, item) => sum + Number(item.product.price || 0) * item.quantity,
		0
	);
}
