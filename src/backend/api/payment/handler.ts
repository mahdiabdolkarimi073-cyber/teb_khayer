import Handler from "@backend/modules/Handler";
import prisma from "@backend/modules/prisma/Prisma";
import {NextResponse} from "next/server";
import Payment from "@backend/modules/payment/Payment";

const basePayload = {
	"terminalid": "شناسه ترمینال",
	"invoiceid": "شناسه فاکتور",
	"amount": "مبلغ",
	"cardnumber": "شماره کارت",
	"payload": "بارگیری",
	"hash": "هش",
	"rrn": "شماره مرجع",
	"tracenumber": "شماره ردیاب",
	"digitalreceipt": "رسید دیجیتالی",
	"datepaid": "تاریخ پرداخت",
	"respcode": "کد پاسخ",
	"respmsg": "پیام پاسخ",
	"issuerbank": "بانک صادر کننده"
};

let finalPayloadFace: ({
	[key in keyof typeof basePayload]: {
		required: false,
		name: string
	}
}) = {} as any;

for (const key in basePayload) {
	finalPayloadFace[key as keyof typeof basePayload] = {
		"required": false,
		"name": basePayload[key as keyof typeof basePayload]
	};
}

export default class PaymentHandler extends Handler {
	async handler() {
		let ok = false;
		let msg = "خطا در پرداخت";
		let redirect = '';
		try {
			console.log('[PAYMENT] callback handler START');

			if (this.request.method === "GET") {
				this.json = Object.fromEntries(new URLSearchParams(this.request.nextUrl.search));
				console.log('[PAYMENT] callback - GET params:', JSON.stringify(this.json));
			}

			const portalPayload = this.$_POST(finalPayloadFace) || {}
			console.log('[PAYMENT] callback - POST payload:', JSON.stringify(portalPayload));

			const user = await this.getUser();
			console.log('[PAYMENT] callback - user:', user?.id || 'NOT FOUND');

			const payment = await prisma.payment.findUnique({
				where: {
					id: portalPayload.invoiceid
				},
				include: {
					actions: true
				}
			});
			console.log('[PAYMENT] callback - payment found:', !!payment, payment?.id);

			if (!payment) throw("فیش پرداخت یافت نشد")
			if (!portalPayload.digitalreceipt) throw("تراکنش تایید نشده است")

			if (payment.receipt) {
				console.log('[PAYMENT] callback - payment already processed, skipping');
				msg = payment.successMsg || "پرداخت قبلاً تایید شده است";
				ok = true;
				redirect = payment.redirect!;
				throw("ALREADY_DONE");
			}

			if (!payment.actions?.length) throw("هیچ عملیاتی برای این پرداخت یافت نشد");

			console.log('[PAYMENT] callback - verifying receipt with Sepehr...');
			const verify = await Payment.acceptReceipt(portalPayload.digitalreceipt);
			if (!verify) throw("تایید نشده است");

			const claimed = await prisma.payment.updateMany({
				where: {id: payment.id, receipt: null},
				data: {receipt: portalPayload.digitalreceipt}
			});
			if (claimed.count === 0) {
				console.log('[PAYMENT] callback - receipt already claimed by another request');
				throw("رسید تکراری است");
			}
			console.log('[PAYMENT] callback - receipt claimed atomically');

			console.log('[PAYMENT] callback - executing', payment.actions.length, 'payment actions');
			try {
				await Payment.handlePaymentAction(payment);
			} catch (actionError) {
				await prisma.payment.update({where: {id: payment.id}, data: {receipt: null}}).catch(() => {});
				throw actionError;
			}

			msg = payment.successMsg;
			ok = true;
			redirect = payment.redirect!;
			console.log('[PAYMENT] callback SUCCESS - redirecting to:', redirect);
		} catch (e: any) {
			if (e === "ALREADY_DONE") {
				console.log('[PAYMENT] callback - already done, redirecting as success');
			} else {
				msg = e.message || e || msg;
				console.error('[PAYMENT] callback FAILED:', e?.message || e);
			}
		}

		return NextResponse.redirect(`${process.env.NODE_ENV === 'production' ? "https://teb-khayyer.ir":"http://localhost:3000"}/payment?msg=${encodeURIComponent(msg)}&status=${ok}${!!redirect ? `&redirect=${encodeURIComponent(redirect)}`:""}`)
	}
}
