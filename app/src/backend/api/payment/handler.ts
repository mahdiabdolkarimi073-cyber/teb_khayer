import Handler from "@backend/modules/Handler";
import prisma from "@backend/modules/prisma/Prisma";
import {NextResponse} from "next/server";
import Payment from "@backend/modules/payment/Payment";
import {paymentLog} from "@/utils/paymentLogger";

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
			paymentLog.info('CALLBACK', 'START - payment callback received');

			if (this.request.method === "GET") {
				this.json = Object.fromEntries(new URLSearchParams(this.request.nextUrl.search));
				paymentLog.debug('CALLBACK', 'GET params', { params: this.json });
			}

			const portalPayload = this.$_POST(finalPayloadFace) || {}
			paymentLog.info('CALLBACK', 'POST payload parsed', {
				invoiceid: portalPayload.invoiceid,
				digitalreceipt: portalPayload.digitalreceipt ? 'PRESENT' : 'MISSING',
				respcode: portalPayload.respcode,
				respmsg: portalPayload.respmsg,
				amount: portalPayload.amount,
				issuerbank: portalPayload.issuerbank,
			});

			const user = await this.getUser();
			paymentLog.debug('CALLBACK', 'User from cookie', { userId: user?.id || 'NOT FOUND' });

			paymentLog.debug('CALLBACK', 'Looking up payment record', { invoiceId: portalPayload.invoiceid });
			const payment = await prisma.payment.findUnique({
				where: {
					id: portalPayload.invoiceid
				},
				include: {
					actions: true
				}
			});
			paymentLog.info('CALLBACK', 'Payment record lookup', { found: !!payment, paymentId: payment?.id, hasActions: !!payment?.actions?.length });

			if (!payment) {
				paymentLog.error('CALLBACK', 'Payment not found', { invoiceId: portalPayload.invoiceid });
				throw("فیش پرداخت یافت نشد")
			}
			if (!portalPayload.digitalreceipt) {
				paymentLog.error('CALLBACK', 'No digital receipt in payload', { invoiceId: portalPayload.invoiceid });
				throw("تراکنش تایید نشده است")
			}

			if (payment.receipt) {
				paymentLog.warn('CALLBACK', 'Payment already processed', { paymentId: payment.id, existingReceipt: payment.receipt });
				msg = payment.successMsg || "پرداخت قبلاً تایید شده است";
				ok = true;
				redirect = payment.redirect!;
				throw("ALREADY_DONE");
			}

			if (!payment.actions?.length) {
				paymentLog.error('CALLBACK', 'No actions configured for payment', { paymentId: payment.id });
				throw("هیچ عملیاتی برای این پرداخت یافت نشد");
			}

			paymentLog.info('CALLBACK', 'Verifying receipt with Sepehr...', { paymentId: payment.id, digitalReceipt: portalPayload.digitalreceipt });
			const verify = await Payment.acceptReceipt(portalPayload.digitalreceipt);
			if (!verify) {
				paymentLog.error('CALLBACK', 'Receipt verification returned false', { paymentId: payment.id });
				throw("تایید نشده است");
			}
			paymentLog.info('CALLBACK', 'Receipt verified successfully', { paymentId: payment.id });

			paymentLog.debug('CALLBACK', 'Atomically claiming receipt', { paymentId: payment.id });
			const claimed = await prisma.payment.updateMany({
				where: {id: payment.id, receipt: null},
				data: {receipt: portalPayload.digitalreceipt}
			});
			if (claimed.count === 0) {
				paymentLog.warn('CALLBACK', 'Receipt already claimed by another request', { paymentId: payment.id });
				throw("رسید تکراری است");
			}
			paymentLog.info('CALLBACK', 'Receipt claimed atomically', { paymentId: payment.id });

			paymentLog.info('CALLBACK', 'Executing payment actions', { paymentId: payment.id, actionCount: payment.actions.length });
			try {
				await Payment.handlePaymentAction(payment);
				paymentLog.info('CALLBACK', 'Payment actions completed', { paymentId: payment.id });
			} catch (actionError) {
				paymentLog.error('CALLBACK', 'Payment actions FAILED, rolling back receipt', {
					paymentId: payment.id,
					error: actionError instanceof Error ? actionError.message : String(actionError),
				});
				await prisma.payment.update({where: {id: payment.id}, data: {receipt: null}}).catch(() => {});
				throw actionError;
			}

			msg = payment.successMsg;
			ok = true;
			redirect = payment.redirect!;
			paymentLog.info('CALLBACK', 'SUCCESS - redirecting', { paymentId: payment.id, redirect, msg });
		} catch (e: any) {
			if (e === "ALREADY_DONE") {
				paymentLog.info('CALLBACK', 'Already done, redirecting as success', { redirect });
			} else {
				msg = e.message || e || msg;
				paymentLog.error('CALLBACK', 'FAILED', { error: e?.message || e, msg });
			}
		}

		const baseUrl = process.env.NODE_ENV === 'production' ? "https://teb-khayyer.ir" : "http://localhost:3000";
		const redirectUrl = `${baseUrl}/payment?msg=${encodeURIComponent(msg)}&status=${ok}${!!redirect ? `&redirect=${encodeURIComponent(redirect)}`:""}`;
		paymentLog.debug('CALLBACK', 'Final redirect URL', { redirectUrl });
		return NextResponse.redirect(redirectUrl)
	}
}
