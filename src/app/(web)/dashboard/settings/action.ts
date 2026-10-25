"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {ssrOptimize} from "@/utils/other";
import {updateFile} from "@backend/utils/file";

export type ProfileData = {
    name: string;
    phone: string;
    nationalCode: string;
    gender: string;
    birthDate: string;
    email: string;
};

export async function getProfile() {
    const user = await getUserFromCookie();
    if (!user) return null;

    const fullUser = await prisma.user.findUnique({
        where: {id: user.id},
        select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            nationalCode: true,
            gender: true,
            birthDate: true,
            email: true,
        },
    });

    return ssrOptimize(fullUser);
}

export async function updateProfile(data: ProfileData) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد شوید"};

    const updated = await prisma.user.update({
        where: {id: user.id},
        data: {
            name: data.name || user.name,
            nationalCode: data.nationalCode || null,
            gender: data.gender || null,
            birthDate: data.birthDate || null,
            email: data.email || null,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            nationalCode: true,
            gender: true,
            birthDate: true,
            email: true,
        },
    });

    return {success: true, user: ssrOptimize(updated)};
}

export async function uploadAvatar(file: File) {
    const user = await getUserFromCookie();
    if (!user) return {success: false, message: "لطفاً ابتدا وارد شوید"};

    const currentAvatar = user.avatar || "/backend/images/default_avatar.png";
    const newPath = await updateFile(file, currentAvatar, `/avatars/${user.id}.$EX`);

    const updated = await prisma.user.update({
        where: {id: user.id},
        data: {avatar: newPath},
        select: {avatar: true},
    });

    return {success: true, avatar: updated.avatar};
}

export async function getLastLogin() {
    const user = await getUserFromCookie();
    if (!user) return null;
    const { getLastSuccessfulLogin } = await import("@/backend/modules/crm/loginTracker");
    return getLastSuccessfulLogin(user.id);
}
