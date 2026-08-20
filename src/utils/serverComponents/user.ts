"use server";

import {cookies} from "next/headers";
import prisma from "@backend/modules/prisma/Prisma";
import {getUser} from "@backend/utils/user";

export async function getUserFromCookie(token2: string | undefined = undefined) {
    const token = cookies().get('token')?.value || token2;
    if (!token) return null;
    return getUser(token);
}
