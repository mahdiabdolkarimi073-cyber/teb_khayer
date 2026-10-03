'use server'

import {DiscountCodeType, ServiceType} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import {setVar} from "@backend/utils/setting";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import AppConfig from "@/config/AppConfig";
import {jalaliStringToDate} from "@/utils/format";

async function requireAdmin() {
	const user = await getUserFromCookie();
	if (!user || (user.role !== "ADMIN" && !AppConfig.ADMINS.includes(user.phone))) {
		throw new Error("دسترسی غیرمجاز");
	}
}

function normalizeCode(code: string) {
	const normalized = code.trim().toUpperCase();
	if (!/^[A-Z0-9_-]{3,50}$/.test(normalized)) throw new Error("کد تخفیف باید بین ۳ تا ۵۰ کاراکتر باشد");
	return normalized;
}

function parseDiscount(type: string, value: string) {
	if (type !== "PERCENTAGE" && type !== "FIXED") throw new Error("نوع تخفیف نامعتبر است");
	const amount = Number(value);
	if (!Number.isFinite(amount) || amount <= 0 || (type === "PERCENTAGE" && amount > 100)) {
		throw new Error(type === "PERCENTAGE" ? "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد" : "مبلغ تخفیف باید بیشتر از صفر باشد");
	}
	return {type: type as DiscountCodeType, value: amount};
}

function parseExpiry(expiresAt: string) {
	if (!expiresAt) return null;
	const date = jalaliStringToDate(expiresAt);
	if (Number.isNaN(date.getTime())) throw new Error("تاریخ انقضا نامعتبر است");
	date.setHours(23, 59, 59, 999);
	return date;
}

export async function setServiceDisabled(serviceId: ServiceType, disabled: boolean) {
	await requireAdmin();
	await prisma.service.update({
		where: { id: serviceId },
		data: { disabled }
	})
}

export async function updateSetting(key: string, value: string) {
	await requireAdmin();
	await setVar(key, value);
}

export async function getDiscountCodes() {
	await requireAdmin();
	return prisma.discountCode.findMany({orderBy: {created_at: "desc"}});
}

export async function createDiscountCode(input: {code: string; type: string; value: string; expiresAt: string}) {
	await requireAdmin();
	const discount = parseDiscount(input.type, input.value);
	return prisma.discountCode.create({
		data: {
			code: normalizeCode(input.code),
			type: discount.type,
			value: discount.value,
			expiresAt: parseExpiry(input.expiresAt),
		}
	});
}

export async function updateDiscountCode(input: {id: string; code: string; type: string; value: string; active: boolean; expiresAt: string}) {
	await requireAdmin();
	const discount = parseDiscount(input.type, input.value);
	return prisma.discountCode.update({
		where: {id: input.id},
		data: {
			code: normalizeCode(input.code),
			type: discount.type,
			value: discount.value,
			active: Boolean(input.active),
			expiresAt: parseExpiry(input.expiresAt),
		}
	});
}

export async function deleteDiscountCode(id: string) {
	await requireAdmin();
	await prisma.discountCode.delete({where: {id}});
}
