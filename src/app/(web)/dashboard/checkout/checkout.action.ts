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

export async function createOrderPortal(products: {
	[key: string]: number
}, fields: typeof CheckoutFields, requestId: string) {
	console.log('[CHECKOUT] createOrderPortal START - products:', Object.keys(products).length, 'items');
	try {
		const user = await getUserFromCookie();
		console.log('[CHECKOUT] user:', user?.id || 'NOT FOUND');

		if (!user) {
			return {
				message: "لطفاً ابتدا وارد شوید",
				status: 401
			}
		}

		const saleEnabled = (await getVar<string>("PRODUCTS_SALE_ENABLED")) !== "false";
		if (!saleEnabled) {
			return {
				message: "فعلاً فروش محصولات غیرفعال است",
				status: 400
			}
		}

		let total = 0;
		let fetchedProduct: {[key: string]: Product} = {};

		// محاسبه مجموع قیمت محصولات
		for (let [id, count] of Object.entries(products)) {
			const product = await prisma.product.findUnique({
				where: { id }
			});
			
			if (!product) {
				return {
					message: `محصول با شناسه ${id} یافت نشد`,
					status: 404
				}
			}

			if (product.stock < count) {
				return {
					message: `موجودی محصول ${product.name} کافی نیست (${product.stock} عدد موجود است)`,
					status: 400
				}
			}

			total += (+(product.price+"") * count);
			fetchedProduct[product.id] = product;
		}

		// اضافه کردن هزینه بسته‌بندی و پست
		const boxFee = +(await getVar<string>("PRODUCT_BOX_FEE") || "0");
		const postFee = +(await getVar<string>("PRODUCT_POST_FEE") || "0");
		total += boxFee + postFee;


		const paymentId = `pymt_${requestId}`;
		const existingPayment = await prisma.payment.findUnique({where: {id: paymentId}});
		if (existingPayment) {
			if (existingPayment.receipt) return {message: 'این سفارش قبلاً پرداخت شده است', status: 409};
			const token = await existingPayment.getToken();
			return {message: 'درحال انتقال...', token, paymentId: existingPayment.id};
		}

		// ایجاد پرداخت
		console.log('[CHECKOUT] creating payment record, total:', total);
		const payment = await prisma.payment.create({
			data: {
				id: paymentId,
				amount: total,
				type: "PRODUCT",
				successMsg: "سفارش شما ثبت شد",
				userId: user.id
			}
		});

		// تولید ID برای سفارش
		let orderId = 1;
		do {
			orderId = +generateRandomNumber(8);
			if (!(await prisma.order.findUnique({where: {id: orderId}}))) break;
		} while (true);


		// ایجاد PaymentAction برای Order
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

		// ایجاد PaymentAction برای محصولات
		for (let [id, count] of Object.entries(products)) {
			const product = fetchedProduct[id];
			
			// کاهش موجودی
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
			
			// ایجاد OrderProduct
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


		// تولید توکن
		console.log('[CHECKOUT] generating payment token...');
		let token;
		try {
			token = await payment.getToken();
			console.log('[CHECKOUT] token generated successfully');
		} catch (tokenError) {
			console.error('[CHECKOUT] token generation FAILED:', tokenError);
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
		console.error('Checkout failed:', error);

		return {
			message: 'خطا در ایجاد سفارش: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'),
			status: 500
		};
	}
}