'use server'

import prisma from "@backend/modules/prisma/Prisma";
import {ssrOptimize} from "@/utils/other";

export async function trackOrder(orderId: number, phone: number) {
	const user = await prisma.user.findUnique({
		where: {
			phone
		}
	})

	return ssrOptimize(await prisma.order.findFirst({
		where: {
			id: orderId,
			userId: user?.id+""
		},
		include: {
			products: {
				include: {
					product: true
				}
			},
			payment: true
		}
	}))
}
