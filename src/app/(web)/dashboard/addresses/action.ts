"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {ssrOptimize} from "@/utils/other";

export type AddressData = {
    title: string;
    name: string;
    phone: string;
    state: string;
    city: string;
    address: string;
    zipcode?: string;
    isDefault?: boolean;
};

export async function getAddresses() {
    const user = await getUserFromCookie();
    if (!user) return [];

    const addresses = await prisma.userAddress.findMany({
        where: {userId: user.id},
        orderBy: [
            {isDefault: "desc"},
            {created_at: "desc"},
        ],
    });

    return ssrOptimize(addresses);
}

export async function addAddress(data: AddressData) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد حساب کاربری خود شوید."};

    if (!data.name?.trim() || !data.phone?.trim() || !data.state?.trim() || !data.city?.trim() || !data.address?.trim()) {
        return {success: false, message: "لطفاً کلیه فیلدهای ضروری آدرس را تکمیل فرمایید."};
    }

    if (data.address.trim().length < 6) {
        return {success: false, message: "آدرس تحویل باید شامل جزئیات کافی باشد."};
    }

    const cleanZip = data.zipcode ? data.zipcode.replace(/\D/g, "") : null;
    if (cleanZip && cleanZip.length !== 10) {
        return {success: false, message: "کد پستی باید دقیقاً ۱۰ رقم باشد."};
    }

    const existingCount = await prisma.userAddress.count({where: {userId: user.id}});
    const shouldBeDefault = data.isDefault === true || existingCount === 0;

    let address;
    if (shouldBeDefault && existingCount > 0) {
        address = await prisma.$transaction(async (tx) => {
            await tx.userAddress.updateMany({
                where: {userId: user.id, isDefault: true},
                data: {isDefault: false},
            });
            return tx.userAddress.create({
                data: {
                    userId: user.id,
                    title: data.title?.trim() || "منزل",
                    name: data.name.trim(),
                    phone: data.phone.trim(),
                    state: data.state.trim(),
                    city: data.city.trim(),
                    address: data.address.trim(),
                    zipcode: cleanZip,
                    isDefault: true,
                },
            });
        });
    } else {
        address = await prisma.userAddress.create({
            data: {
                userId: user.id,
                title: data.title?.trim() || "منزل",
                name: data.name.trim(),
                phone: data.phone.trim(),
                state: data.state.trim(),
                city: data.city.trim(),
                address: data.address.trim(),
                zipcode: cleanZip,
                isDefault: shouldBeDefault,
            },
        });
    }

    return {success: true, message: "آدرس با موفقیت ذخیره شد.", address: ssrOptimize(address)};
}

export async function updateAddress(id: string, data: AddressData) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد حساب کاربری خود شوید."};

    const existing = await prisma.userAddress.findFirst({
        where: {id, userId: user.id},
    });
    if (!existing) return {success: false, message: "آدرس مورد نظر یافت نشد."};

    if (!data.name?.trim() || !data.phone?.trim() || !data.state?.trim() || !data.city?.trim() || !data.address?.trim()) {
        return {success: false, message: "لطفاً کلیه فیلدهای ضروری آدرس را تکمیل فرمایید."};
    }

    if (data.address.trim().length < 6) {
        return {success: false, message: "آدرس تحویل باید شامل جزئیات کافی باشد."};
    }

    const cleanZip = data.zipcode ? data.zipcode.replace(/\D/g, "") : null;
    if (cleanZip && cleanZip.length !== 10) {
        return {success: false, message: "کد پستی باید دقیقاً ۱۰ رقم باشد."};
    }

    let address;
    if (data.isDefault === true) {
        address = await prisma.$transaction(async (tx) => {
            await tx.userAddress.updateMany({
                where: {userId: user.id, isDefault: true},
                data: {isDefault: false},
            });
            return tx.userAddress.update({
                where: {id},
                data: {
                    title: data.title?.trim() || "منزل",
                    name: data.name.trim(),
                    phone: data.phone.trim(),
                    state: data.state.trim(),
                    city: data.city.trim(),
                    address: data.address.trim(),
                    zipcode: cleanZip,
                    isDefault: true,
                },
            });
        });
    } else {
        address = await prisma.userAddress.update({
            where: {id},
            data: {
                title: data.title?.trim() || "منزل",
                name: data.name.trim(),
                phone: data.phone.trim(),
                state: data.state.trim(),
                city: data.city.trim(),
                address: data.address.trim(),
                zipcode: cleanZip,
                ...(data.isDefault !== undefined ? {isDefault: data.isDefault} : {}),
            },
        });
    }

    return {success: true, message: "آدرس با موفقیت به‌روزرسانی شد.", address: ssrOptimize(address)};
}

export async function deleteAddress(id: string) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد حساب کاربری خود شوید."};

    const existing = await prisma.userAddress.findFirst({
        where: {id, userId: user.id},
    });
    if (!existing) return {success: false, message: "آدرس مورد نظر یافت نشد."};

    const wasDefault = existing.isDefault;

    await prisma.$transaction(async (tx) => {
        await tx.userAddress.delete({where: {id}});

        if (wasDefault) {
            const next = await tx.userAddress.findFirst({
                where: {userId: user.id},
                orderBy: {created_at: "desc"},
            });
            if (next) {
                await tx.userAddress.update({
                    where: {id: next.id},
                    data: {isDefault: true},
                });
            }
        }
    });

    return {success: true, message: "آدرس با موفقیت حذف شد."};
}

export async function setDefaultAddress(id: string) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد حساب کاربری خود شوید."};

    const existing = await prisma.userAddress.findFirst({
        where: {id, userId: user.id},
    });
    if (!existing) return {success: false, message: "آدرس مورد نظر یافت نشد."};

    await prisma.$transaction(async (tx) => {
        await tx.userAddress.updateMany({
            where: {userId: user.id, isDefault: true},
            data: {isDefault: false},
        });

        await tx.userAddress.update({
            where: {id},
            data: {isDefault: true},
        });
    });

    return {success: true, message: "آدرس پیش‌فرض با موفقیت تنظیم شد."};
}
