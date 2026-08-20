'use server';

import prisma from "@backend/modules/prisma/Prisma";
import {arabicToEnglishNumber} from "@/utils/other";
import {cookies} from "next/headers";
import {isPhoneVerified} from "@/app/(app)/app/signup/action";

export async function handleLogin(phone: string, password: string) {
	phone = arabicToEnglishNumber(phone);
	const user = await prisma.user.findUnique({
		where: {
			phone: +phone
		}
	});

	if (!user) return `کاربر یافت نشد ${+phone}`;
	if (user.password !== password) return "رمزعبور اشتباه است";

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
