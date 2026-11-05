"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {Prisma, Product} from "@prisma/client";
import OrderCreateArgs = Prisma.OrderCreateArgs;
import ProductCreateArgs = Prisma.ProductCreateArgs;
import {generateRandomNumber} from "@backend/utils/string";
import OrderProductCreateArgs = Prisma.OrderProductCreateArgs;
import {getVar} from "@backend/utils/setting";
import {paymentLog} from "@/utils/paymentLogger";
import Payment from "@backend/modules/payment/Payment";
import {SmsService} from "@backend/modules/sms/SmsService";

type CheckoutData = Record<string, unknown>;

type DiscountCalculation = {
	amount: number;
	message: string;
};

function normalizeDiscountCode(code: string) {
	return code.trim().toUpperCase();
}

async function calculateDiscount(code: string, productsTotal: number): Promise<DiscountCalculation> {
	if (!code.trim()) return {amount: 0, message: ""};

	const discount = await prisma.discountCode.findUnique({where: {code: normalizeDiscountCode(code)}});
	if (!discount || !discount.active) return {amount: 0, message: "کد تخفیف معتبر نیست"};
	if (discount.expiresAt) {
		const endOfExpiryDay = new Date(discount.expiresAt);
		endOfExpiryDay.setHours(23, 59, 59, 999);
		if (endOfExpiryDay < new Date()) return {amount: 0, message: "تاریخ انقضای کد تخفیف گذشته است"};
	}

	const amount = discount.type === "PERCENTAGE"
		? productsTotal * (discount.value / 100)
		: discount.value;
	return {amount: Math.min(Math.max(amount, 0), productsTotal), message: `کد تخفیف ${discount.code} اعمال شد`};
}

export async function applyDiscountCode(code: string, products: {[key: string]: number}) {
	try {
		const user = await getUserFromCookie();
		if (!user) return {success: false, amount: 0, message: "لطفاً ابتدا وارد شوید"};

		let productsTotal = 0;
		for (const [id, count] of Object.entries(products)) {
			if (!Number.isInteger(count) || count < 1) return {success: false, amount: 0, message: "سبد خرید نامعتبر است"};
			const product = await prisma.product.findUnique({where: {id}, select: {price: true, stock: true}});
			if (!product || product.stock < count) return {success: false, amount: 0, message: "موجودی سبد خرید تغییر کرده است"};
			productsTotal += Number(product.price) * count;
		}

		const result = await calculateDiscount(code, productsTotal);
		return {success: Boolean(code.trim()) && result.amount > 0, amount: result.amount, message: result.message};
	} catch {
		return {success: false, amount: 0, message: "بررسی کد تخفیف انجام نشد"};
	}
}

export async function createOrderPortal(
	products: {[key: string]: number},
	fields: CheckoutData,
	requestId: string
) {
	paymentLog.info('CHECKOUT', 'START', { productCount: Object.keys(products).length, requestId });
	try {
		const user = await getUserFromCookie();
		paymentLog.debug('CHECKOUT', 'User from cookie', { userId: user?.id || 'NOT FOUND' });
		if (!user) return {message: "لطفاً ابتدا وارد شوید", status: 401};

		const saleEnabled = (await getVar<string>("PRODUCTS_SALE_ENABLED")) !== "false";

		const paymentMethod = fields.paymentMethod === "cashOnDelivery" ? "cashOnDelivery" : "online";
		const cashOnDeliveryEnabled = (await getVar<string>("CASH_ON_DELIVERY_ENABLED")) === "true";
		if (paymentMethod === "cashOnDelivery" && !cashOnDeliveryEnabled) return {message: "پرداخت در محل فعلاً فعال نیست", status: 400};

		let productsTotal = 0;
		const fetchedProduct: {[key: string]: Product} = {};
		for (const [id, count] of Object.entries(products)) {
			if (!Number.isInteger(count) || count < 1) return {message: "تعداد محصول نامعتبر است", status: 400};
			const product = await prisma.product.findUnique({where: {id}});
			if (!product) return {message: `محصول با شناسه ${id} یافت نشد`, status: 404};
			if (product.stock < count) return {message: `موجودی محصول ${product.name} کافی نیست (${product.stock} عدد موجود است)`, status: 400};
			if (!saleEnabled && !product.forceAvailable) return {message: `فعلاً فروش محصول ${product.name} غیرفعال است`, status: 400};
			productsTotal += Number(product.price) * count;
			fetchedProduct[product.id] = product;
		}

		const discountCode = typeof fields.discountCode === "string" ? fields.discountCode : "";
		const discount = await calculateDiscount(discountCode, productsTotal);
		if (discountCode.trim() && !discount.amount) return {message: discount.message, status: 400};

		const [
			boxFeeStr,
			postFeeStr,
			freeShippingThresholdStr,
			freeShippingEnabledStr,
			deliveryEstimatedDaysSetting,
			unifiedShippingEnabledStr,
			unifiedShippingFeeStr,
			unifiedShippingDiscountStr
		] = await Promise.all([
			getVar<string>("PRODUCT_BOX_FEE"),
			getVar<string>("PRODUCT_POST_FEE"),
			getVar<string>("FREE_SHIPPING_THRESHOLD"),
			getVar<string>("FREE_SHIPPING_ENABLED"),
			getVar<string>("DELIVERY_ESTIMATED_DAYS"),
			getVar<string>("UNIFIED_SHIPPING_ENABLED"),
			getVar<string>("UNIFIED_SHIPPING_FEE"),
			getVar<string>("UNIFIED_SHIPPING_DISCOUNT"),
		]);

		const safeBoxFee = Number.isFinite(Number(boxFeeStr)) ? Number(boxFeeStr) : 0;
		const safePostFee = Number.isFinite(Number(postFeeStr)) ? Number(postFeeStr) : 36000;
		const rawThreshold = Number(freeShippingThresholdStr);
		const hasValidThreshold = Number.isFinite(rawThreshold) && rawThreshold > 0;
		const isFreeShippingGloballyEnabled = freeShippingEnabledStr !== "false" && hasValidThreshold;
		const freeShippingThreshold = isFreeShippingGloballyEnabled ? rawThreshold : 0;
		const deliveryEstimatedDays = deliveryEstimatedDaysSetting || "۳ تا ۵ روز کاری";
		const unifiedShippingEnabled = unifiedShippingEnabledStr === "true";
		const unifiedShippingFee = Number.isFinite(Number(unifiedShippingFeeStr)) ? Number(unifiedShippingFeeStr) : 39000;
		const unifiedShippingDiscount = Number.isFinite(Number(unifiedShippingDiscountStr)) ? Number(unifiedShippingDiscountStr) : 0;

		const shippingPaymentMethod = fields.shippingPaymentMethod === "postpaid" ? "postpaid" : "online";

		const hasFreeShippingProduct = Object.values(fetchedProduct).some(p => Boolean(p.freeShipping));
		const qualifiesFreeShipping = hasFreeShippingProduct || (isFreeShippingGloballyEnabled && productsTotal >= freeShippingThreshold);

		let calculatedShippingFee = safePostFee;
		let originalShippingFee = safePostFee;
		let shippingDiscount = 0;
		let shippingHierarchyApplied: "FREE_SHIPPING" | "UNIFIED" | "PRODUCT_CUSTOM" | "DEFAULT_POST" = "DEFAULT_POST";
		let hasCustomProductShipping = false;
		let effectiveBoxFee = safeBoxFee;

		let productShippingConfigs: Record<string, any> = {};
		try {
			const { getProductsShipping } = await import("@/app/(web)/admin/products/shipping.action");
			productShippingConfigs = await getProductsShipping(Object.keys(products));
		} catch (err) {
			console.warn("Failed to get product shipping in checkout.action:", err);
		}

		if (qualifiesFreeShipping) {
			calculatedShippingFee = 0;
			originalShippingFee = 0;
			shippingDiscount = 0;
			shippingHierarchyApplied = "FREE_SHIPPING";
		} else if (unifiedShippingEnabled) {
			originalShippingFee = unifiedShippingFee;
			shippingDiscount = unifiedShippingDiscount;
			calculatedShippingFee = Math.max(0, unifiedShippingFee - unifiedShippingDiscount);
			shippingHierarchyApplied = "UNIFIED";
		} else {
			const customProductEntries = Object.entries(productShippingConfigs).filter(([_, cfg]) => cfg && cfg.hasCustomShipping);

			if (customProductEntries.length > 0) {
				hasCustomProductShipping = true;
				const fees = Object.keys(products).map(id => {
					const cfg = productShippingConfigs[id];
					if (cfg && cfg.hasCustomShipping) {
						return Math.max(0, Number(cfg.shippingFee || 0) - Number(cfg.shippingDiscount || 0));
					}
					return safePostFee;
				});
				const origFees = Object.keys(products).map(id => {
					const cfg = productShippingConfigs[id];
					if (cfg && cfg.hasCustomShipping) {
						return Number(cfg.shippingFee || 0);
					}
					return safePostFee;
				});
				calculatedShippingFee = Math.max(...fees);
				originalShippingFee = Math.max(...origFees);
				shippingDiscount = Math.max(0, originalShippingFee - calculatedShippingFee);
				shippingHierarchyApplied = "PRODUCT_CUSTOM";
			} else {
				calculatedShippingFee = safePostFee;
				originalShippingFee = safePostFee;
				shippingDiscount = 0;
				shippingHierarchyApplied = "DEFAULT_POST";
			}
		}

		// محاسبه هزینه بسته‌بندی:
		// اگر محصولی دارای هزینه ارسال اختصاصی باشد، هزینه عمومی بسته‌بندی برای جلوگیری از دریافت مضاعف حذف می‌شود.
		// همچنین اگر محصولی دارای هزینه بسته‌بندی اختصاصی باشد، اعمال می‌گردد.
		if (hasCustomProductShipping) {
			const customBoxes = Object.keys(products)
				.filter(id => productShippingConfigs[id]?.hasCustomBox)
				.map(id => Number(productShippingConfigs[id]?.boxFee || 0));
			effectiveBoxFee = customBoxes.length > 0 ? Math.max(...customBoxes) : 0;
		} else {
			const customBoxes = Object.keys(products)
				.filter(id => productShippingConfigs[id]?.hasCustomBox)
				.map(id => Number(productShippingConfigs[id]?.boxFee || 0));
			if (customBoxes.length > 0) {
				effectiveBoxFee = Math.max(...customBoxes);
			} else {
				effectiveBoxFee = safeBoxFee;
			}
		}

		if (!Number.isFinite(calculatedShippingFee) || calculatedShippingFee < 0) {
			calculatedShippingFee = safePostFee;
		}
		if (!Number.isFinite(originalShippingFee) || originalShippingFee < 0) {
			originalShippingFee = calculatedShippingFee;
		}

		const onlineShippingFee = (qualifiesFreeShipping || shippingPaymentMethod === "postpaid") ? 0 : calculatedShippingFee;
		const postpaidFee = (!qualifiesFreeShipping && shippingPaymentMethod === "postpaid") ? calculatedShippingFee : 0;

		const total = Math.max(0, Math.round(Number(productsTotal || 0) + Number(effectiveBoxFee || 0) + Number(onlineShippingFee || 0) - Number(discount.amount || 0)));

		const paymentId = `pymt_${requestId}`;
		const existingPayment = await prisma.payment.findUnique({where: {id: paymentId}});
		if (existingPayment) {
			if (existingPayment.receipt) return {message: 'این سفارش قبلاً ثبت شده است', status: 409};
			const token = await existingPayment.getToken();
			return {message: 'درحال انتقال...', token, paymentId: existingPayment.id};
		}

		const payment = await prisma.payment.create({
			data: {
				id: paymentId,
				amount: total,
				type: "PRODUCT",
				successMsg: paymentMethod === "cashOnDelivery" ? "سفارش شما با موفقیت ثبت شد" : "سفارش شما ثبت شد",
				userId: user.id
			}
		});

		let orderId = 1;
		do {
			orderId = +generateRandomNumber(8);
			if (!(await prisma.order.findUnique({where: {id: orderId}}))) break;
		} while (true);

		const orderInfo = {
			...fields,
			shippingPaymentMethod,
			shippingFee: onlineShippingFee,
			postpaidFee,
			calculatedShippingFee,
			originalShippingFee,
			shippingDiscount,
			boxFee: effectiveBoxFee,
			isFreeShipping: qualifiesFreeShipping,
			freeShippingReason: qualifiesFreeShipping
				? (hasFreeShippingProduct ? "حاوی محصول با ارسال رایگان" : "مبلغ سفارش بالاتر از سقف ارسال رایگان")
				: null,
			deliveryEstimatedDays,
			shippingHierarchyApplied,
			productsTotal,
			discountAmount: discount.amount,
		};

		await prisma.paymentAction.create({
			data: {
				type: "CREATE_MODEL",
				targetModel: "order",
				paymentId: payment.id,
				data: {id: orderId, paymentId: payment.id, userId: user.id, status: "PENDING", info: orderInfo} as OrderCreateArgs['data']
			}
		});

		for (const [id, count] of Object.entries(products)) {
			const product = fetchedProduct[id];
			await prisma.paymentAction.create({
				data: {
					type: "CHANGE_MODEL",
					targetRecord: id,
					targetModel: "product",
					paymentId: payment.id,
					data: {stock: product.stock - count} as ProductCreateArgs['data']
				}
			});
			await prisma.paymentAction.create({
				data: {
					type: "CREATE_MODEL",
					targetModel: "orderProduct",
					paymentId: payment.id,
					data: {count, orderId, productId: product.id} as OrderProductCreateArgs['data']
				}
			});
		}

		if (total === 0 || paymentMethod === "cashOnDelivery") {
			const paymentWithActions = await prisma.payment.findUnique({where: {id: payment.id}, include: {actions: true}});
			if (!paymentWithActions) return {message: "خطا در ثبت سفارش", status: 500};
			await Payment.handlePaymentAction(paymentWithActions);
			await prisma.payment.update({
				where: {id: payment.id},
				data: {receipt: total === 0 ? `FREE_${payment.id}` : `COD_${payment.id}`}
			});
			return {message: payment.successMsg || "سفارش شما با موفقیت ثبت شد", orderCompleted: true, redirect: "/dashboard/orders?status=current"};
		}

		try {
			await SmsService.scheduleAbandonedOrderReminder({
				orderId,
				paymentId: payment.id,
				userId: user.id,
				userPhone: String(fields.phone || user.phone || ""),
				customerName: String(fields.name || user.name || "مشتری گرامی"),
				totalAmount: total,
			});
		} catch (scheduleError) {
			paymentLog.warn('CHECKOUT', 'Failed to schedule abandoned order reminder', { error: String(scheduleError) });
		}

		let token: string;
		try {
			token = await payment.getToken();
		} catch (gatewayErr: any) {
			paymentLog.error('CHECKOUT', 'Gateway error', { error: gatewayErr?.message || String(gatewayErr) });
			return {
				message: gatewayErr?.message || "خطا در ارتباط با درگاه پرداخت بانکی. لطفاً مجدداً تلاش کنید.",
				status: 502
			};
		}

		return {message: "درحال انتقال...", token, paymentId: payment.id};
	} catch (error: any) {
		paymentLog.error('CHECKOUT', 'Unexpected error', {error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined});
		return {
			message: error?.message ? `خطا در ثبت سفارش: ${error.message}` : 'خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.',
			status: 500
		};
	}
}
