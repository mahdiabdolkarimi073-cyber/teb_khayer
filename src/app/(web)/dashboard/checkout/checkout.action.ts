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
		if (!saleEnabled) return {message: "فعلاً فروش محصولات غیرفعال است", status: 400};

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
			productsTotal += Number(product.price) * count;
			fetchedProduct[product.id] = product;
		}

		const discountCode = typeof fields.discountCode === "string" ? fields.discountCode : "";
		const discount = await calculateDiscount(discountCode, productsTotal);
		if (discountCode.trim() && !discount.amount) return {message: discount.message, status: 400};
		const boxFee = +(await getVar<string>("PRODUCT_BOX_FEE") || "0");
		const postFee = +(await getVar<string>("PRODUCT_POST_FEE") || "0");
		const total = Math.max(0, productsTotal + boxFee + postFee - discount.amount);

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

		await prisma.paymentAction.create({
			data: {
				type: "CREATE_MODEL",
				targetModel: "order",
				paymentId: payment.id,
				data: {id: orderId, paymentId: payment.id, userId: user.id, status: "PENDING", info: fields} as OrderCreateArgs['data']
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

		if (paymentMethod === "cashOnDelivery") {
			const paymentWithActions = await prisma.payment.findUnique({where: {id: payment.id}, include: {actions: true}});
			if (!paymentWithActions) return {message: "خطا در ثبت سفارش", status: 500};
			await Payment.handlePaymentAction(paymentWithActions);
			await prisma.payment.update({where: {id: payment.id}, data: {receipt: `COD_${payment.id}`}});
			return {message: payment.successMsg, orderCompleted: true, redirect: "/dashboard/orders"};
		}

		const token = await payment.getToken();
		return {message: "درحال انتقال...", token, paymentId: payment.id};
	} catch (error) {
		paymentLog.error('CHECKOUT', 'Unexpected error', {error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined});
		return {message: 'خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.', status: 500};
	}
}
