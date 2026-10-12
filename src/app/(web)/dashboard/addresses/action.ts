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
    if (!user) return {success: false, message: "لطفاً ابتدا وارد شوید"};

    const existingCount = await prisma.userAddress.count({where: {userId: user.id}});

    const address = await prisma.userAddress.create({
        data: {
            userId: user.id,
            title: data.title || "منزل",
            name: data.name,
            phone: data.phone,
            state: data.state,
            city: data.city,
            address: data.address,
            zipcode: data.zipcode || null,
            isDefault: existingCount === 0,
        },
    });

    return {success: true, address: ssrOptimize(address)};
}

export async function updateAddress(id: string, data: AddressData) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد شوید"};

    const existing = await prisma.userAddress.findFirst({
        where: {id, userId: user.id},
    });
    if (!existing) return {success: false, message: "آدرس یافت نشد"};

    const address = await prisma.userAddress.update({
        where: {id},
        data: {
            title: data.title || "منزل",
            name: data.name,
            phone: data.phone,
            state: data.state,
            city: data.city,
            address: data.address,
            zipcode: data.zipcode || null,
        },
    });

    return {success: true, address: ssrOptimize(address)};
}

export async function deleteAddress(id: string) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد شوید"};

    const existing = await prisma.userAddress.findFirst({
        where: {id, userId: user.id},
    });
    if (!existing) return {success: false, message: "آدرس یافت نشد"};

    const wasDefault = existing.isDefault;

    await prisma.userAddress.delete({where: {id}});

    if (wasDefault) {
        const next = await prisma.userAddress.findFirst({
            where: {userId: user.id},
            orderBy: {created_at: "desc"},
        });
        if (next) {
            await prisma.userAddress.update({
                where: {id: next.id},
                data: {isDefault: true},
            });
        }
    }

    return {success: true};
}

export async function setDefaultAddress(id: string) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد شوید"};

    const existing = await prisma.userAddress.findFirst({
        where: {id, userId: user.id},
    });
    if (!existing) return {success: false, message: "آدرس یافت نشد"};

    await prisma.userAddress.updateMany({
        where: {userId: user.id, isDefault: true},
        data: {isDefault: false},
    });

    await prisma.userAddress.update({
        where: {id},
        data: {isDefault: true},
    });

    return {success: true};
}
