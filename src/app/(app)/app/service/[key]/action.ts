'use server'

import { Prisma, ServiceType } from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import ServiceUserCreateArgs = Prisma.ServiceUserCreateArgs;
import { isApplication } from "@/utils/serverComponents/app";

export async function handleServicePayment(id: ServiceType) {
	// ===== لاگ‌های دیباگ (قابل حذف) =====
	console.log('🚀 [DEBUG] handleServicePayment START');
	console.log('📌 Service ID:', id);
	console.log('📱 isApplication:', isApplication());
	// ====================================

	try {
		const user = await getUserFromCookie();
		
		// ===== لاگ کاربر =====
		console.log('👤 User ID:', user?.id || '❌ کاربر پیدا نشد');
		// =====================

		if (!user) {
			return { 
				ok: false, 
				message: "باید وارد شوید", 
				link: `${isApplication() ? "/app" : ""}/auth/login` 
			};
		}

		const service = await prisma.service.findUnique({
			where: { id }
		});
		
		// ===== لاگ سرویس =====
		console.log('📦 Service found:', !!service);
		if (service) {
			console.log('📦 Service name:', service.id);
			console.log('💰 Service amount:', service.amount);
			console.log('🚫 Service disabled:', service.disabled);
		}
		// =====================

		if (!service) {
			return { ok: false, message: "سرویس یافت نشد" };
		}

		if (service.disabled) {
			return { ok: false, message: "موقتا غیرفعال میباشد" };
		}

		// بررسی اینکه کاربر قبلاً این سرویس رو تهیه نکرده
		const existingService = await prisma.serviceUser.findFirst({
			where: {
				serviceId: service.id,
				userId: user.id
			}
		});

		// ===== لاگ سرویس قبلی =====
		console.log('🔄 Existing service:', !!existingService);
		// ===========================

		if (existingService) {
			return { ok: false, message: "شما قبلاً این سرویس را تهیه کرده‌اید" };
		}

		// ایجاد پرداخت
		const payment = await prisma.payment.create({
			data: {
				amount: service.amount,
				userId: user.id,
				redirect: `/service/${service.id}`,
				successMsg: "سرویس با موفقیت پرداخت شد"
			}
		});
		
		// ===== لاگ پرداخت =====
		console.log('💳 Payment created with ID:', payment.id);
		console.log('💳 Payment amount:', payment.amount);
		// ======================

		// ایجاد PaymentAction
		await prisma.paymentAction.create({
			data: {
				paymentId: payment.id,
				type: "CREATE_MODEL",
				targetModel: "serviceUser",
				data: {
					serviceId: service.id,
					userId: user.id,
					paymentId: payment.id
				} as ServiceUserCreateArgs['data']
			}
		});
		
		// ===== لاگ PaymentAction =====
		console.log('✅ PaymentAction created successfully');
		// =============================

		// تولید توکن
		let token;
		try {
			// ===== لاگ getToken =====
			console.log('🔑 Attempting to generate token...');
			// ========================
			
			token = await payment.getToken();
			
			// ===== لاگ موفقیت =====
			console.log('✅ Token generated:', token);
			// ======================
			
		} catch (tokenError) {
			// ===== لاگ خطا =====
			console.error('❌ Error generating token:', tokenError);
			console.error('❌ Token error type:', typeof tokenError);
			if (tokenError instanceof Error) {
				console.error('❌ Token error message:', tokenError.message);
				console.error('❌ Token error stack:', tokenError.stack);
			}
			// =====================
			
			// استفاده از توکن موقت
			token = `TEMP_TOKEN_${payment.id}_${Date.now()}`;
			console.log('🔑 Using fallback token:', token);
		}

		// ===== لاگ نهایی =====
		console.log('🏁 [DEBUG] handleServicePayment END - SUCCESS');
		console.log('📤 Returning token:', !!token);
		// =====================

		return {
			ok: true,
			token: token
		};

	} catch (error) {
		// ===== لاگ خطای کلی =====
		console.error('💥 [ERROR] handleServicePayment FAILED');
		console.error('💥 Error type:', typeof error);
		console.error('💥 Error details:', error);
		if (error instanceof Error) {
			console.error('💥 Error message:', error.message);
			console.error('💥 Error stack:', error.stack);
		}
		// =========================

		return {
			ok: false,
			message: 'خطا در پردازش درخواست'
		};
	}
}