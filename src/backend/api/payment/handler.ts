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
			if (this.request.method === "GET") {
				this.json = Object.fromEntries(new URLSearchParams(this.request.nextUrl.search));
			}
			const portalPayload = this.$_POST(finalPayloadFace) || {}
			const user = await this.getUser();

			const payment = await prisma.payment.findUnique({
				where: {
					id: portalPayload.invoiceid
				},
				include: {
					actions: true
				}
			});


			if (!payment) throw("فیش پرداخت یافت نشد")
			if (!portalPayload.digitalreceipt) throw("تراکنش تایید نشده است")
			if (!!(await prisma.payment.findUnique({
				where: {
					receipt: portalPayload.digitalreceipt
				}
			}))) throw("رسید تکراری است")


			if (!payment.actions?.length) throw("هیچ عملیاتی برای این پرداخت یافت نشد");

			await Payment.handlePaymentAction(payment);

			await prisma.payment.update({
				where: {id: payment.id},
				data: {
					receipt: portalPayload.digitalreceipt
				}
			})

			const verify = await Payment.acceptReceipt(portalPayload.digitalreceipt);
			if (!verify) throw("تایید نشده است");

			msg = payment.successMsg;
			ok = true;
			redirect = payment.redirect!;
		} catch (e: any) {
			msg= e.message || e || msg;
		}

		return NextResponse.redirect(`${process.env.NODE_ENV === 'production' ? "https://teb-khayyer.ir":"http://localhost:3000"}/payment?msg=${msg}&status=${ok}${!!redirect ? `&redirect=${redirect}`:""}`)
	}
}
