'use server';

import prisma from "@backend/modules/prisma/Prisma";
import {arabicToEnglishNumber} from "@/utils/other";
import {cookies, headers} from "next/headers";
import {isPhoneVerified} from "@/app/(app)/app/signup/action";
import {recordUserLogin} from "@/backend/modules/crm/loginTracker";

export async function handleLogin(phone: string, password: string) {
	phone = arabicToEnglishNumber(phone);
	const user = await prisma.user.findUnique({
		where: {
			phone: +phone
		}
	});

	if (!user) return `کاربر یافت نشد ${+phone}`;
	if (user.password !== password) return "رمزعبور اشتباه است";

	// Record successful login for CRM and user security monitoring
	try {
		const reqHeaders = headers();
		const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || reqHeaders.get("x-real-ip") || "127.0.0.1";
		const userAgent = reqHeaders.get("user-agent") || "وب‌سایت طِب خیّر";
		await recordUserLogin(user.id, user.phone, ip, userAgent);
	} catch (e) {
		console.warn("Login log skipped:", e);
	}

	const ex = new Date();
	ex.setMonth(ex.getMonth() + 2);
	cookies().set("token", user.token, {path: "/", expires: ex})
	return "وارد شدید"
}

export async function handleNewPassword(phone: string, password: string) {
	if (!(await isPhoneVerified(phone))) return "شماره تلفن تایید نشده است";
	try {
		const user = await prisma.user.update({
			where: {
				phone: +phone
			},
			data: {
				password
			}
		});

		const ex = new Date();
		ex.setMonth(ex.getMonth() + 2);
		cookies().set("token", user.token, {path: "/", expires: ex})
		return "رمزعبور تغییر یافت"
	} catch {
		return "خطا در بررسی اطلاعات، بعدا تلاش کنید"
	}
}
