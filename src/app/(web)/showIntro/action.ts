'use server';

import {getUserFromCookie} from "@/utils/serverComponents/user";
import prisma from "@backend/modules/prisma/Prisma";

export async function checkVisitPay() {
	const user = await getUserFromCookie();

	return await prisma.serviceUser.findFirst({
		where: {
			serviceId: "VISIT",
			userId: user?.id+""
		}
	})
}
