import {Payment as PaymentType, PaymentAction} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import AppConfig from "@/config/AppConfig";

export default class Payment {
	static TID = AppConfig.TID;
	static MID = "982024031001819"

	static async getToken(amount: number, invoice: string, email?: string) {
		if (process.env.NODE_ENV === "development") return invoice;
		const payload = {
			"Amount": (amount * 10)+"",
			"callbackURL": "https://teb-khayyer.ir/api/payment",
			"invoiceID": invoice,
			"terminalID": Payment.TID,
			...(email && ({
				email,
				"CellNumber": email
			}))
		};
		const res = await Payment.fetch('/PeymentApi/GetToken', payload) as ({
			"Status": 0,
			"Accesstoken": "PORTAL_TOKEN",
			"AccessToken": "PORTAL_TOKEN"
		});
		console.log(payload, res);
		if (res.Status !== 0) {
			console.log(res);
			throw(`FAILED TO CREATE PAYMENT TOKEN: ${res.Status}`);
		}
		return res.Accesstoken ?? res.AccessToken;
	}

	static async acceptReceipt(digitalReceipt: string) {
		if (process.env.NODE_ENV === "development") return true;

		const res = await Payment.fetch("/PeymentApi/Advice", {
			digitalreceipt: digitalReceipt,
			Tid: Payment.TID
		}) as ({
			Status: "Ok" | "Duplicate" | "NOk";
			ReturnId: string;
			Message: string;
		});

		if (res.Status !== 'Ok') throw(res.Message);

		return true;
	}

	static async fetch(path: string, body: {[key: string | symbol]: string}) {
		const myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

		const urlencoded = new URLSearchParams();
		for (let key in body) {
			urlencoded.append(key, body[key]);
		}

		const requestOptions = {
			method: "POST",
			headers: myHeaders,
			body: urlencoded
		};
		const base = process.env.NODE_ENV === "production" ? "https://sepehr.shaparak.ir:8081/V1" : "https://teb-khayyer.ir/api/proxy/sepehr.shaparak.ir:8081/V1";
		return await fetch(base+path, requestOptions)
			.then(r => r.json());
	}

	static async handlePaymentAction(payment: PaymentType & {actions: PaymentAction[]}) {
		const {actions} = payment;

		for (let action of actions) {
			const {targetModel, targetRecord, data = {}, type} = action;
			const model = prisma[targetModel as keyof typeof prisma] as typeof prisma.payment;
			if (!model) throw("مدل عملیات ناشناخته است");

			switch (type) {
				case "CREATE_MODEL":
					await model.create({
						data: data as any
					})
					break;
				case "CHANGE_MODEL":
					if (!targetRecord || !(await model.findUnique({where: {id: targetRecord}}))) throw("نشانه رکورد یافت نشد")
					await model.update({
						data: data as any,
						where: {
							id: targetRecord
						}
					})
					break;
				case "CREATE_MANY":
					await model.createMany({
						data: data as any[]
					})
					break;
				default:
					throw("عملیات ناشناخته")
			}
		}
	}
}
