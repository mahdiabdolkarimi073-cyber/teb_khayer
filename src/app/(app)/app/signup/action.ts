'use server';

import prisma from "@backend/modules/prisma/Prisma";
import {arabicToEnglishNumber} from "@/utils/other";
import {cookies} from "next/headers";
import AppConfig from "@/config/AppConfig";
import {generateRandomNumber} from "@backend/utils/string";
import {getVar} from "@backend/utils/setting";


export async function handleSignup(name: string, phone: string, password: string) {
	if (!(await isPhoneVerified(phone))) return "شماره تلفن تایید نشده است";
	phone = arabicToEnglishNumber(phone);
	const preUser = await prisma.user.findUnique({
		where: {
			phone: +phone
		}
	});
	let finalPhone = +phone;
	if (!!preUser) return `${finalPhone} کاربر از قبل ثبت نام کرده است`;

	const user = await prisma.user.create({
		data: {
			name,
			phone: finalPhone,
			password,
			role: AppConfig.ADMINS.includes(finalPhone) ? "ADMIN":"DEFAULT"
		}
	});

	const ex = new Date();
	ex.setMonth(ex.getMonth() + 2);
	cookies().set("token", user.token, {path: "/", expires: ex})
	return "باموفقیت ثبت نام شدید"
}

export async function checkCode(phone: string, code: string) {
	let msg = "تایید شد";
	let ok = true;
	try {
		const verify = await prisma.verify.findUnique({
			where: {
				phone: +phone
			}
		});
		if (!verify) throw("کد تایید ارسال نشده است")
		if (verify.code+"" === code) {
			await prisma.verify.update({
				where: {
					phone: +phone
				},
				data: {
					userCode: +code
				}
			})
		} else throw("کد تایید اشتباه است");
	} catch (e: any) {
		ok = false;
		msg= e?.message ?? e;
	}

	return {
		message: msg,
		ok
	}
}
let PHONE_N: {
	[key: string]: number
} = {}
export async function sendCode(phone: string) {
	const pre = await prisma.verify.findUnique({
		where: {
			phone: +phone
		}
	});
	const verified = !!pre && pre?.code === pre?.userCode;
	let code = (verified ? generateRandomNumber(6):pre?.code || generateRandomNumber(6))+"";
	while (code.length !== 6) {
		code = generateRandomNumber(6);
	}
	const expireTime = +(await getVar('VERCODE_EXPIRE_MINUTES') || "");

	const isValid = ()=>{
		if (!pre) return false;
		const date = new Date(pre.created_at);
		date.setMinutes(date.getMinutes() + Math.round((expireTime || 5) / 2));
		const now = new Date();
		return now.getTime() < date.getTime();
	}

	const sendCode = async ()=>{
		if (pre) await prisma.verify.delete({where: {id: pre?.id}});
		await prisma.verify.create({
			data: {
				phone: +phone,
				code: +code
			}
		})
		PHONE_N[phone] ||=0;
		PHONE_N[phone] += 1;
		await sendSMSCode(phone+"", code+"")
	}

	let msg = "ارسال شد";

	try {
		if (isValid() && (PHONE_N[phone] || 0) > 2) {
			msg = "کد تایید از قبل ارسال شده است";
		} else {
			await sendCode();
		}
	} catch (e: any) {
		msg = e?.message ?? e;
	}

	return {
		message: msg,
	}
}

export async function sendSMSCode(phone: string, code: string) {
	return await fetch("https://api.sms.ir/v1/send/verify", {
		method: "POST",
		headers: {
			"X-API-KEY": "EIRbpHiltcCYi0F1DOcpxYOpXfdthSUyJWu1XXThKaRCF8VuGLySVI2cMrBAYIjE",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			"mobile": (+phone)+"",
			"templateId": 527837 || 100000,
			"parameters": [
				{
					"name": "CODE",
					"value": code
				}
			]
		})
	}).then(async (r)=>{
		const json = await r.json();
		console.log(phone,code,json);
		return json;
	});
}

export async function checkExists(phone: string) {
	return !!await prisma.user.findFirst({
		where: {
			phone: +phone
		}
	})
}

export async function isPhoneVerified(phone: string) {
	const verify = await prisma.verify.findUnique({
		where: {
			phone: +phone
		}
	});
	if (!verify) return false;
	return verify.code === verify.userCode;
}
