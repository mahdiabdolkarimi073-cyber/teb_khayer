import {Payment as PaymentType, PaymentAction} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import AppConfig from "@/config/AppConfig";

export default class Payment {
	static TID = AppConfig.TID;
	static MID = "982024031001819"

	static async getToken(amount: number, invoice: string, cellNumber?: string) {
		console.log(`[PAYMENT] getToken START - amount: ${amount}, invoice: ${invoice}, TID: ${Payment.TID}, cellNumber: ${cellNumber || 'N/A'}`);

		if (process.env.NODE_ENV === "development") {
			console.log('[PAYMENT] getToken - development mode, returning invoice as token');
			return invoice;
		}

		const callbackURL = (process.env.PAYMENT_CALLBACK_URL || "https://teb-khayyer.ir/api/payment").trim();
		console.log('[PAYMENT] getToken - callbackURL:', callbackURL);

		const payload: Record<string, string> = {
			"Amount": (amount * 10) + "",
			"callbackURL": callbackURL,
			"invoiceID": invoice,
			"terminalID": Payment.TID,
		};

		if (cellNumber) {
			const cleanPhone = cellNumber.replace(/[^0-9]/g, "");
			if (cleanPhone.length >= 10) {
				const formattedPhone = cleanPhone.startsWith("0") ? cleanPhone : "0" + cleanPhone;
				payload["CellNumber"] = formattedPhone;
				console.log('[PAYMENT] getToken - CellNumber set to:', formattedPhone);
			} else {
				console.log('[PAYMENT] getToken - CellNumber too short, skipping:', cleanPhone);
			}
		}

		console.log('[PAYMENT] getToken - sending request to Sepehr:', JSON.stringify({...payload, Amount: payload.Amount}));

		let res;
		try {
			res = await Payment.fetch('/PeymentApi/GetToken', payload) as ({
				"Status": number,
				"Accesstoken": string,
				"AccessToken": string,
				"Message": string,
				"Description": string
			});
			console.log('[PAYMENT] getToken - Sepehr response:', JSON.stringify(res));
		} catch (fetchError) {
			console.error('[PAYMENT] getToken - NETWORK ERROR calling Sepehr:', fetchError);
			throw new Error(`خطا در ارتباط با درگاه پرداخت: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
		}

		if (res.Status !== 0) {
			console.error(`[PAYMENT] getToken FAILED - Status: ${res.Status}, Message: ${res.Message || res.Description || 'N/A'}`);
			throw new Error(`درگاه پرداخت توکن صادر نکرد (کد: ${res.Status}${res.Message ? ' - ' + res.Message : ''}${res.Description ? ' - ' + res.Description : ''})`);
		}

		const token = res.Accesstoken ?? res.AccessToken;
		if (!token) {
			console.error('[PAYMENT] getToken FAILED - Status 0 but no token in response:', JSON.stringify(res));
			throw new Error('درگاه پرداخت توکن صادر نکرد');
		}

		console.log(`[PAYMENT] getToken SUCCESS - token received (length: ${token.length})`);
		return token;
	}

	static async acceptReceipt(digitalReceipt: string) {
		console.log(`[PAYMENT] acceptReceipt START - digitalReceipt: ${digitalReceipt}`);

		if (process.env.NODE_ENV === "development") {
			console.log('[PAYMENT] acceptReceipt - development mode, skipping verification');
			return true;
		}

		let res;
		try {
			res = await Payment.fetch("/PeymentApi/Advice", {
				digitalreceipt: digitalReceipt,
				Tid: Payment.TID
			}) as ({
				Status: "Ok" | "Duplicate" | "NOk";
				ReturnId: string;
				Message: string;
			});
			console.log('[PAYMENT] acceptReceipt - Sepehr response:', JSON.stringify(res));
		} catch (fetchError) {
			console.error('[PAYMENT] acceptReceipt - NETWORK ERROR:', fetchError);
			throw new Error(`خطا در تایید پرداخت: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
		}

		if (res.Status !== 'Ok') {
			console.error(`[PAYMENT] acceptReceipt FAILED - Status: ${res.Status}, Message: ${res.Message}`);
			throw new Error(res.Message || `تایید پرداخت ناموفق (${res.Status})`);
		}

		console.log('[PAYMENT] acceptReceipt SUCCESS');
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
		const url = base + path;
		console.log(`[PAYMENT] fetch - POST ${url}`);

		const response = await fetch(url, requestOptions);
		if (!response.ok) {
			console.error(`[PAYMENT] fetch - HTTP ${response.status} ${response.statusText}`);
		}
		const text = await response.text();
		console.log(`[PAYMENT] fetch - raw response: ${text.substring(0, 500)}`);
		try {
			return JSON.parse(text);
		} catch {
			console.error('[PAYMENT] fetch - failed to parse JSON response');
			return { Status: -1, Message: "Invalid JSON response from gateway" };
		}
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
