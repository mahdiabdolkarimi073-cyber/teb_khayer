import { Prisma, PrismaClient } from "@prisma/client";
import { BasicSchemaInformation } from "@backend/modules/Schema";
import Payment from "@backend/modules/payment/Payment";
import {paymentLog} from "@/utils/paymentLogger";
import * as fs from "node:fs";

if (typeof window !== "undefined") {
	throw new Error("Prisma client must not be loaded in the browser. Check for accidental imports of @backend/modules/prisma/Prisma in client components.");
}

declare const global: {
	instance: PrismaClient
}
declare const globalThis: {
	instance: PrismaClient
}

const instance: PrismaClient = global.instance ?? globalThis.instance ?? new PrismaClient({
	log: ['info']
});
global.instance = instance;
globalThis.instance = instance;

const prisma = instance.$extends({
	result: {
		payment: {
			getToken: {
				needs: {
					id: true,
					amount: true
				},
				compute: ({ id, amount }) => {
					return async () => {
						paymentLog.debug('PRISMA-EXT', 'getToken extension called', { paymentId: id, amount });

						const payment = await instance.payment.findUnique({
							where: {
								id
							},
							include: {
								actions: true,
								user: true
							}
						})

						if (!amount) {
							paymentLog.info('PRISMA-EXT', 'Zero-amount payment, executing actions directly', { paymentId: id });
							if (payment) {
								await Payment.handlePaymentAction(payment);
								return `FREE:${payment.redirect}`
							} else {
								paymentLog.error('PRISMA-EXT', 'Payment not found for zero-amount', { paymentId: id });
								return "NOTFOUND";
							}
						}

						const userPhone = payment?.user?.phone ? "0" + payment.user.phone : undefined;
						paymentLog.debug('PRISMA-EXT', 'Calling Payment.getToken', { paymentId: id, amount, userPhone: userPhone || 'N/A' });
						return Payment.getToken(amount, id, userPhone);
					}
				}
			}
		}
	}
});


export function PrismaDefinitions() {
	return BasicSchemaInformation;
}

export default prisma;
