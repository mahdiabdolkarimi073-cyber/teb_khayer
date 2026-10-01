import {Payment as PaymentType, PaymentAction} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import AppConfig from "@/config/AppConfig";

/**
 * استخراج جزئیات کامل خطای fetch از undici
 * چون err.message همیشه فقط "fetch failed" هست
 */
function describeFetchError(err: unknown): Record<string, unknown> {
	if (!(err instanceof Error)) {
		return { raw: String(err) };
	}

	const cause = (err as any).cause as any;

	return {
		name: err.name,
		message: err.message,
		stack: err.stack?.split("\n").slice(0, 5).join("\n"),
		// ↓↓↓ این‌ها علت واقعی رو نشون می‌دن ↓↓↓
		cause: cause ? {
			name: cause.name,
			message: cause.message,
			code: cause.code,           // ECONNREFUSED / ETIMEDOUT / ENOTFOUND / ...
			errno: cause.errno,
			syscall: cause.syscall,
			address: cause.address,     // IP سرور سپهر
			port: cause.port,           // 8081
			// برای خطاهای TLS
			reason: cause.reason,
			library: cause.library,
			// برای AggregateError (چند IP)
			errors: Array.isArray(cause.errors)
				? cause.errors.map((e: any) => ({
					message: e?.message,
					code: e?.code,
					address: e?.address,
					port: e?.port,
				}))
				: undefined,
		} : undefined,
	};
}

export default class Payment {
	static TID = AppConfig.TID;
	static MID = "982024031001819"

	static async getToken(amount: number, invoice: string, email?: string) {
		console.log(`[PAYMENT] getToken START - amount: ${amount}, invoice: ${invoice}, TID: ${Payment.TID}`);

		if (process.env.NODE_ENV === "development") {
			console.log('[PAYMENT] getToken - development mode, returning invoice as token');
			return invoice;
		}

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
		console.log('[PAYMENT] getToken - sending request to Sepehr:', JSON.stringify(payload));

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
			// ★★★ این خط عوض شد: جزئیات کامل خطا لاگ میشه
			console.error('[PAYMENT] getToken - NETWORK ERROR calling Sepehr:', JSON.stringify(describeFetchError(fetchError), null, 2));
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
			// ★★★ این خط هم عوض شد
			console.error('[PAYMENT] acceptReceipt - NETWORK ERROR:', JSON.stringify(describeFetchError(fetchError), null, 2));
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

		const requestOptions: RequestInit = {
			method: "POST",
			headers: myHeaders,
			body: urlencoded,
			// ★★★ این‌ها رو اضافه کردیم تا بتونیم زمان‌بندی و redirect رو کنترل کنیم
			redirect: "manual",
		};

		const base = process.env.NODE_ENV === "production"
			? "https://sepehr.shaparak.ir:8081/V1"
			: "https://teb-khayyer.ir/api/proxy/sepehr.shaparak.ir:8081/V1";
		const url = base + path;

		// ★★★ لاگ کامل URL و body
		console.log(`[PAYMENT] fetch - POST ${url}`);
		console.log(`[PAYMENT] fetch - body: ${urlencoded.toString()}`);
		console.log(`[PAYMENT] fetch - NODE_ENV: ${process.env.NODE_ENV}`);

		const startedAt = Date.now();
		let response: Response;
		try {
			response = await fetch(url, requestOptions);
		} catch (err) {
			// ★★★ اینجا مهم‌ترین بخشه: قبل از پرتاب خطا، جزئیات کامل رو لاگ می‌کنیم
			const elapsed = Date.now() - startedAt;
			console.error(`[PAYMENT] fetch - FETCH THREW after ${elapsed}ms`);
			console.error(`[PAYMENT] fetch - URL: ${url}`);
			console.error(`[PAYMENT] fetch - ERROR DETAILS:`, JSON.stringify(describeFetchError(err), null, 2));
			throw err;
		}

		const elapsed = Date.now() - startedAt;
		console.log(`[PAYMENT] fetch - response in ${elapsed}ms - HTTP ${response.status} ${response.statusText}`);
		console.log(`[PAYMENT] fetch - response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

		const text = await response.text();
		console.log(`[PAYMENT] fetch - raw response (first 500 chars): ${text.substring(0, 500)}`);

		if (!response.ok) {
			console.error(`[PAYMENT] fetch - HTTP ${response.status} ${response.statusText}`);
		}

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