'use server'

import { Prisma, ServiceType } from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import ServiceUserCreateArgs = Prisma.ServiceUserCreateArgs;
import { isApplication } from "@/utils/serverComponents/app";

export async function handleServicePayment(id: ServiceType) {
	console.log('[SERVICE-PAYMENT] START - service:', id);
	try {
		const user = await getUserFromCookie();
		console.log('[SERVICE-PAYMENT] user:', user?.id || 'NOT FOUND');

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

		if (!service) {
			return { ok: false, message: "سرویس یافت نشد" };
		}

		if (service.disabled) {
			return { ok: false, message: "موقتا غیرفعال میباشد" };
		}

		const existingService = await prisma.serviceUser.findFirst({
			where: {
				serviceId: service.id,
				userId: user.id
			}
		});

		if (existingService) {
			return { ok: false, message: "شما قبلاً این سرویس را تهیه کرده‌اید" };
		}

		console.log('[SERVICE-PAYMENT] creating payment, amount:', service.amount);
		const payment = await prisma.payment.create({
			data: {
				amount: service.amount,
				userId: user.id,
				redirect: `/service/${service.id}`,
				successMsg: "سرویس با موفقیت پرداخت شد"
			}
		});

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

		console.log('[SERVICE-PAYMENT] generating token...');
		let token;
		try {
			token = await payment.getToken();
			console.log('[SERVICE-PAYMENT] token generated successfully');
		} catch (tokenError) {
			console.error('[SERVICE-PAYMENT] token generation FAILED:', tokenError);
			await prisma.payment.delete({where: {id: payment.id}}).catch(() => {});
			return {
				ok: false,
				message: 'خطا در ایجاد توکن پرداخت: ' + (tokenError instanceof Error ? tokenError.message : String(tokenError))
			};
		}

		return {
			ok: true,
			token: token
		};

	} catch (error) {
		console.error('Service payment failed:', error);

		return {
			ok: false,
			message: 'خطا در پردازش درخواست'
		};
	}
}
