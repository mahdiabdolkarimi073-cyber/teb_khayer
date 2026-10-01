"use server";

import {CheckoutFields} from "@/app/(web)/dashboard/checkout/checkout.fields";
import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {Prisma, Product} from "@prisma/client";
import OrderCreateArgs = Prisma.OrderCreateArgs;
import ProductCreateArgs = Prisma.ProductCreateArgs;
import {generateRandomNumber} from "@backend/utils/string";
import OrderProductCreateArgs = Prisma.OrderProductCreateArgs;
import {getVar} from "@backend/utils/setting";
import {paymentLog} from "@/utils/paymentLogger";

export async function createOrderPortal(products: {
	[key: string]: number
}, fields: typeof CheckoutFields, requestId: string) {
	paymentLog.info('CHECKOUT', 'START', { productCount: Object.keys(products).length, requestId });
	try {
		const user = await getUserFromCookie();
		paymentLog.debug('CHECKOUT', 'User from cookie', { userId: user?.id || 'NOT FOUND' });

		if (!user) {
			paymentLog.warn('CHECKOUT', 'No user found');
			return {
				message: "لطفاً ابتدا وارد شوید",
				status: 401
			}
		}

		const saleEnabled = (await getVar<string>("PRODUCTS_SALE_ENABLED")) !== "false";
		if (!saleEnabled) {
			paymentLog.warn('CHECKOUT', 'Products sale is disabled');
			return {
				message: "فعلاً فروش محصولات غیرفعال است",
				status: 400
			}
		}

		let total = 0;
		let fetchedProduct: {[key: string]: Product} = {};

		paymentLog.debug('CHECKOUT', 'Validating products and calculating total');
		for (let [id, count] of Object.entries(products)) {
			const product = await prisma.product.findUnique({
				where: { id }
			});

			if (!product) {
				paymentLog.error('CHECKOUT', 'Product not found', { productId: id });
				return {
					message: `محصول با شناسه ${id} یافت نشد`,
					status: 404
				}
			}

			if (product.stock < count) {
				paymentLog.warn('CHECKOUT', 'Insufficient stock', { productId: id, productName: product.name, requested: count, available: product.stock });
				return {
					message: `موجودی محصول ${product.name} کافی نیست (${product.stock} عدد موجود است)`,
					status: 400
				}
			}

			total += (+(product.price+"") * count);
			fetchedProduct[product.id] = product;
		}
		paymentLog.debug('CHECKOUT', 'Products validated', { total, productCount: Object.keys(fetchedProduct).length });

		const boxFee = +(await getVar<string>("PRODUCT_BOX_FEE") || "0");
		const postFee = +(await getVar<string>("PRODUCT_POST_FEE") || "0");
		total += boxFee + postFee;
		paymentLog.debug('CHECKOUT', 'Fees added', { boxFee, postFee, total });

		const paymentId = `pymt_${requestId}`;
		const existingPayment = await prisma.payment.findUnique({where: {id: paymentId}});
		if (existingPayment) {
			if (existingPayment.receipt) {
				paymentLog.warn('CHECKOUT', 'Payment already completed', { paymentId });
				return {message: 'این سفارش قبلاً پرداخت شده است', status: 409};
			}
			paymentLog.info('CHECKOUT', 'Existing payment found, regenerating token', { paymentId });
			const token = await existingPayment.getToken();
			return {message: 'درحال انتقال...', token, paymentId: existingPayment.id};
		}

		paymentLog.info('CHECKOUT', 'Creating payment record', { paymentId, amount: total });
		const payment = await prisma.payment.create({
			data: {
				id: paymentId,
				amount: total,
				type: "PRODUCT",
				successMsg: "سفارش شما ثبت شد",
				userId: user.id
			}
		});
		paymentLog.debug('CHECKOUT', 'Payment record created', { paymentId: payment.id });

		let orderId = 1;
		do {
			orderId = +generateRandomNumber(8);
			if (!(await prisma.order.findUnique({where: {id: orderId}}))) break;
		} while (true);
		paymentLog.debug('CHECKOUT', 'Order ID generated', { orderId });

		await prisma.paymentAction.create({
			data: {
				type: "CREATE_MODEL",
				targetModel: "order",
				paymentId: payment.id,
				data: {
					id: orderId,
					paymentId: payment.id,
					userId: user.id,
					status: "PENDING",
					info: fields
				} as OrderCreateArgs['data']
			}
		});
		paymentLog.debug('CHECKOUT', 'Order payment action created', { orderId });

		for (let [id, count] of Object.entries(products)) {
			const product = fetchedProduct[id];

			await prisma.paymentAction.create({
				data: {
					type: "CHANGE_MODEL",
					targetRecord: id,
					targetModel: "product",
					paymentId: payment.id,
					data: {
						stock: product.stock - count
					} as ProductCreateArgs['data']
				}
			});

			await prisma.paymentAction.create({
				data: {
					type: "CREATE_MODEL",
					targetModel: "orderProduct",
					paymentId: payment.id,
					data: {
						count,
						orderId: orderId,
						productId: product.id
					} as OrderProductCreateArgs['data']
				}
			});
		}
		paymentLog.debug('CHECKOUT', 'All product payment actions created', { productCount: Object.keys(products).length });

		paymentLog.info('CHECKOUT', 'Generating payment token', { paymentId: payment.id });
		let token;
		try {
			token = await payment.getToken();
			paymentLog.info('CHECKOUT', 'Token generated successfully', { paymentId: payment.id, tokenLength: token?.length });
		} catch (tokenError) {
			paymentLog.error('CHECKOUT', 'Token generation FAILED', {
				paymentId: payment.id,
				error: tokenError instanceof Error ? tokenError.message : String(tokenError),
			});
			await prisma.payment.delete({where: {id: payment.id}}).catch(() => {});
			return {
				message: 'خطا در ایجاد توکن پرداخت: ' + (tokenError instanceof Error ? tokenError.message : String(tokenError)),
				status: 500
			};
		}

		return {
			message: "درحال انتقال...",
			token: token,
			paymentId: payment.id
		};

	} catch (error) {
		paymentLog.error('CHECKOUT', 'Unexpected error', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return {
			message: 'خطا در ایجاد سفارش: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'),
			status: 500
		};
	}
}
