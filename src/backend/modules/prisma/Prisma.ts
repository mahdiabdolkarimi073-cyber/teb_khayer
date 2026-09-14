import { Prisma, PrismaClient } from "@prisma/client";
import { BasicSchemaInformation } from "@backend/modules/Schema";
import Payment from "@backend/modules/payment/Payment";
import * as fs from "node:fs";

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
							if (payment) {
								await Payment.handlePaymentAction(payment);
								return `FREE:${payment.redirect}`
							} else return "NOTFOUND";
						}
						const userPhone = payment?.user?.phone ? "0" + payment.user.phone : undefined;
						console.log('[PAYMENT] getToken extension - amount:', amount, 'invoice:', id, 'phone:', userPhone);
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
