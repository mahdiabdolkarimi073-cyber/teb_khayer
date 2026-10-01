"use server";

import { Prisma, ServiceType } from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import ServiceUserCreateArgs = Prisma.ServiceUserCreateArgs;
import { isApplication } from "@/utils/serverComponents/app";
import { paymentLog } from "@/utils/paymentLogger";

export async function handleServicePayment(id: ServiceType) {
	paymentLog.info('SERVICE-PAYMENT', 'START', { serviceId: id });
	try {
		const user = await getUserFromCookie();
		paymentLog.debug('SERVICE-PAYMENT', 'User from cookie', { userId: user?.id || 'NOT FOUND' });

		if (!user) {
			paymentLog.warn('SERVICE-PAYMENT', 'No user found');
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
			paymentLog.error('SERVICE-PAYMENT', 'Service not found', { serviceId: id });
			return { ok: false, message: "سرویس یافت نشد" };
		}

		if (service.disabled) {
			paymentLog.warn('SERVICE-PAYMENT', 'Service is disabled', { serviceId: id });
			return { ok: false, message: "موقتا غیرفعال میباشد" };
		}

		const existingService = await prisma.serviceUser.findFirst({
			where: {
				serviceId: service.id,
				userId: user.id
			}
		});

		if (existingService) {
			paymentLog.warn('SERVICE-PAYMENT', 'User already has this service', { serviceId: id, userId: user.id });
			return { ok: false, message: "شما قبلاً این سرویس را تهیه کرده‌اید" };
		}

		paymentLog.info('SERVICE-PAYMENT', 'Creating payment record', { serviceId: id, amount: service.amount, userId: user.id });
		const payment = await prisma.payment.create({
			data: {
				amount: service.amount,
				userId: user.id,
				redirect: `/service/${service.id}`,
				successMsg: "سرویس با موفقیت پرداخت شد"
			}
		});
		paymentLog.debug('SERVICE-PAYMENT', 'Payment record created', { paymentId: payment.id });

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
		paymentLog.debug('SERVICE-PAYMENT', 'Payment action created', { paymentId: payment.id });

		paymentLog.info('SERVICE-PAYMENT', 'Generating token', { paymentId: payment.id });
		let token;
		try {
			token = await payment.getToken();
			paymentLog.info('SERVICE-PAYMENT', 'Token generated successfully', { paymentId: payment.id, tokenLength: token?.length });
		} catch (tokenError) {
			paymentLog.error('SERVICE-PAYMENT', 'Token generation FAILED', {
				paymentId: payment.id,
				error: tokenError instanceof Error ? tokenError.message : String(tokenError),
			});
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
		paymentLog.error('SERVICE-PAYMENT', 'Unexpected error', {
			serviceId: id,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return {
			ok: false,
			message: 'خطا در پردازش درخواست'
		};
	}
}
