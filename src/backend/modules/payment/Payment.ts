import {Payment as PaymentType, PaymentAction} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import AppConfig from "@/config/AppConfig";
import {paymentLog, withTimer} from "@/utils/paymentLogger";

export default class Payment {
	static TID = AppConfig.TID;
	static MID = "982024031001819"

	static async getToken(amount: number, invoice: string, cellNumber?: string) {
		paymentLog.info('GET_TOKEN', 'START', { amount, invoice, TID: Payment.TID, cellNumber: cellNumber || 'N/A' });

		if (process.env.NODE_ENV === "development") {
			paymentLog.warn('GET_TOKEN', 'Development mode - returning invoice as token (no real gateway call)', { invoice });
			return invoice;
		}

		const callbackURL = (process.env.PAYMENT_CALLBACK_URL || "https://teb-khayyer.ir/api/payment").trim();
		paymentLog.debug('GET_TOKEN', 'Callback URL configured', { callbackURL });

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
				paymentLog.debug('GET_TOKEN', 'CellNumber set', { formattedPhone });
			} else {
				paymentLog.warn('GET_TOKEN', 'CellNumber too short, skipping', { cleanPhone });
			}
		}

		paymentLog.debug('GET_TOKEN', 'Sending request to Sepehr gateway', { payload: { ...payload, Amount: payload.Amount } });

		let res;
		try {
			res = await withTimer('GET_TOKEN', 'Sepehr GetToken API call', () =>
				Payment.fetch('/PeymentApi/GetToken', payload)
			) as ({
				"Status": number,
				"Accesstoken": string,
				"AccessToken": string,
				"Message": string,
				"Description": string
			});
			paymentLog.info('GET_TOKEN', 'Sepehr response received', { status: res.Status, message: res.Message || res.Description || 'N/A' });
		} catch (fetchError) {
			paymentLog.error('GET_TOKEN', 'NETWORK ERROR calling Sepehr', {
				error: fetchError instanceof Error ? fetchError.message : String(fetchError),
			});
			throw new Error(`خطا در ارتباط با درگاه پرداخت: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
		}

		if (res.Status !== 0) {
			paymentLog.error('GET_TOKEN', 'FAILED - gateway returned non-zero status', {
				status: res.Status,
				message: res.Message || res.Description || 'N/A',
			});
			throw new Error(`درگاه پرداخت توکن صادر نکرد (کد: ${res.Status}${res.Message ? ' - ' + res.Message : ''}${res.Description ? ' - ' + res.Description : ''})`);
		}

		const token = res.Accesstoken ?? res.AccessToken;
		if (!token) {
			paymentLog.error('GET_TOKEN', 'FAILED - Status 0 but no token in response', { response: res });
			throw new Error('درگاه پرداخت توکن صادر نکرد');
		}

		paymentLog.info('GET_TOKEN', 'SUCCESS - token received', { tokenLength: token.length });
		return token;
	}

	static async acceptReceipt(digitalReceipt: string) {
		paymentLog.info('ACCEPT_RECEIPT', 'START', { digitalReceipt });

		if (process.env.NODE_ENV === "development") {
			paymentLog.warn('ACCEPT_RECEIPT', 'Development mode - skipping verification');
			return true;
		}

		let res;
		try {
			res = await withTimer('ACCEPT_RECEIPT', 'Sepehr Advice API call', () =>
				Payment.fetch("/PeymentApi/Advice", {
					digitalreceipt: digitalReceipt,
					Tid: Payment.TID
				})
			) as ({
				Status: "Ok" | "Duplicate" | "NOk";
				ReturnId: string;
				Message: string;
			});
			paymentLog.info('ACCEPT_RECEIPT', 'Sepehr response received', { status: res.Status, returnId: res.ReturnId, message: res.Message });
		} catch (fetchError) {
			paymentLog.error('ACCEPT_RECEIPT', 'NETWORK ERROR', {
				error: fetchError instanceof Error ? fetchError.message : String(fetchError),
			});
			throw new Error(`خطا در تایید پرداخت: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
		}

		if (res.Status !== 'Ok') {
			paymentLog.error('ACCEPT_RECEIPT', 'FAILED', { status: res.Status, message: res.Message });
			throw new Error(res.Message || `تایید پرداخت ناموفق (${res.Status})`);
		}

		paymentLog.info('ACCEPT_RECEIPT', 'SUCCESS');
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
		paymentLog.debug('FETCH', `POST ${url}`, { bodyKeys: Object.keys(body) });

		const response = await fetch(url, requestOptions);
		if (!response.ok) {
			paymentLog.error('FETCH', `HTTP ${response.status} ${response.statusText}`, { url });
		}
		const text = await response.text();
		paymentLog.debug('FETCH', 'Raw response', { body: text.substring(0, 500) });
		try {
			return JSON.parse(text);
		} catch {
			paymentLog.error('FETCH', 'Failed to parse JSON response', { url, rawBody: text.substring(0, 200) });
			return { Status: -1, Message: "Invalid JSON response from gateway" };
		}
	}

	static async handlePaymentAction(payment: PaymentType & {actions: PaymentAction[]}) {
		const {actions} = payment;
		paymentLog.info('HANDLE_ACTIONS', 'START', { actionCount: actions.length, paymentId: payment.id });

		for (let i = 0; i < actions.length; i++) {
			const action = actions[i];
			const {targetModel, targetRecord, data = {}, type} = action;
			paymentLog.debug('HANDLE_ACTIONS', `Action ${i + 1}/${actions.length}`, { type, targetModel, targetRecord });

			const model = prisma[targetModel as keyof typeof prisma] as typeof prisma.payment;
			if (!model) {
				paymentLog.error('HANDLE_ACTIONS', `Unknown model: ${targetModel}`, { actionIndex: i });
				throw("مدل عملیات ناشناخته است");
			}

			switch (type) {
				case "CREATE_MODEL":
					paymentLog.debug('HANDLE_ACTIONS', `CREATE_MODEL on ${targetModel}`, { dataKeys: Object.keys(data as any) });
					await model.create({ data: data as any });
					paymentLog.debug('HANDLE_ACTIONS', `CREATE_MODEL done on ${targetModel}`);
					break;
				case "CHANGE_MODEL":
					if (!targetRecord || !(await model.findUnique({where: {id: targetRecord}}))) {
						paymentLog.error('HANDLE_ACTIONS', `Record not found: ${targetRecord} in ${targetModel}`);
						throw("نشانه رکورد یافت نشد");
					}
					paymentLog.debug('HANDLE_ACTIONS', `CHANGE_MODEL on ${targetModel}`, { targetRecord, dataKeys: Object.keys(data as any) });
					await model.update({ data: data as any, where: { id: targetRecord } });
					paymentLog.debug('HANDLE_ACTIONS', `CHANGE_MODEL done on ${targetModel}`);
					break;
				case "CREATE_MANY":
					paymentLog.debug('HANDLE_ACTIONS', `CREATE_MANY on ${targetModel}`, { count: Array.isArray(data) ? data.length : 1 });
					await model.createMany({ data: data as any[] });
					paymentLog.debug('HANDLE_ACTIONS', `CREATE_MANY done on ${targetModel}`);
					break;
				default:
					paymentLog.error('HANDLE_ACTIONS', `Unknown action type: ${type}`, { actionIndex: i });
					throw("عملیات ناشناخته");
			}
		}
		paymentLog.info('HANDLE_ACTIONS', 'All actions completed', { actionCount: actions.length });
	}
}
