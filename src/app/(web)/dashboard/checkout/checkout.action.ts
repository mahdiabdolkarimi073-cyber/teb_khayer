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
}, fields: typeof CheckoutFields) {
	// ===== لاگ شروع =====
	console.log('🚀 [CHECKOUT] createOrderPortal START');
	console.log('📦 Products:', Object.keys(products).length);
	console.log('📋 Fields:', Object.keys(fields));
	// ====================

	try {
		const user = await getUserFromCookie();
		
		// ===== لاگ کاربر =====
		console.log('👤 User ID:', user?.id || '❌ کاربر پیدا نشد');
		// =====================

		if (!user) {
			return {
				message: "لطفاً ابتدا وارد شوید",
				status: 401
			}
		}

		let total = 0;
		let fetchedProduct: {[key: string]: Product} = {};

		// محاسبه مجموع قیمت محصولات
		for (let [id, count] of Object.entries(products)) {
			console.log(`🔍 Checking product: ${id}, count: ${count}`);
			
			const product = await prisma.product.findUnique({
				where: { id }
			});
			
			if (!product) {
				console.error(`❌ Product not found: ${id}`);
				return {
					message: `محصول با شناسه ${id} یافت نشد`,
					status: 404
				}
			}

			if (product.stock < count) {
				console.error(`❌ Stock insufficient: ${product.name} (stock: ${product.stock}, requested: ${count})`);
				return {
					message: `موجودی محصول ${product.name} کافی نیست (${product.stock} عدد موجود است)`,
					status: 400
				}
			}

			total += (+(product.price+"") * count);
			fetchedProduct[product.id] = product;
			console.log(`✅ Product ${product.name} added, price: ${product.price}, subtotal: ${+(product.price+"") * count}`);
		}

		// اضافه کردن هزینه بسته‌بندی و پست
		const boxFee = +(await getVar<string>("PRODUCT_BOX_FEE") || "0");
		const postFee = +(await getVar<string>("PRODUCT_POST_FEE") || "0");
		total += boxFee + postFee;

		console.log('💰 Total amount:', total);
		console.log('📦 Box fee:', boxFee);
		console.log('📬 Post fee:', postFee);

		// ایجاد پرداخت
		const payment = await prisma.payment.create({
			data: {
				amount: total,
				type: "PRODUCT",
				successMsg: "سفارش شما ثبت شد",
				userId: user.id
			}
		});

		console.log('💳 Payment created:', payment.id);

		// تولید ID برای سفارش
		let orderId = 1;
		do {
			orderId = +generateRandomNumber(8);
			if (!(await prisma.order.findUnique({where: {id: orderId}}))) break;
		} while (true);

		console.log('📋 Order ID:', orderId);

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
			console.log(`✅ OrderProduct created for ${product.name} (${count}x)`);
		}

		console.log('✅ All PaymentActions created');

		// تولید توکن
		let token;
		try {
			console.log('🔑 Generating token...');
			token = await payment.getToken();
			console.log('✅ Token generated:', token);
		} catch (tokenError) {
			console.error('❌ Token generation failed:', tokenError);
			if (tokenError instanceof Error) {
				console.error('❌ Error message:', tokenError.message);
				console.error('❌ Error stack:', tokenError.stack);
			}
			// استفاده از توکن موقت
			token = `TEMP_TOKEN_${payment.id}_${Date.now()}`;
			console.log('🔑 Using fallback token:', token);
		}

		console.log('🏁 [CHECKOUT] createOrderPortal END - SUCCESS');

		return {
			message: "درحال انتقال...",
			token: token,
			paymentId: payment.id
		};

	} catch (error) {
		// ===== لاگ خطای کلی =====
		console.error('💥 [CHECKOUT] createOrderPortal FAILED');
		console.error('💥 Error type:', typeof error);
		console.error('💥 Error details:', error);
		if (error instanceof Error) {
			console.error('💥 Error message:', error.message);
			console.error('💥 Error stack:', error.stack);
		}
		// =========================

		return {
			message: 'خطا در ایجاد سفارش: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'),
			status: 500
		};
	}
}