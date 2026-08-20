'use server';


import prisma from "@backend/modules/prisma/Prisma";
import {ssrOptimize} from "@/utils/other";
import {Order, OrderStatus} from "@prisma/client";

export async function getAllOrders(skip = 0, status: OrderStatus | undefined, phone: number | undefined) {
	return ssrOptimize(await prisma.order.findMany({
		where: {
			...(status && ({
				status
			})),
			...(phone && ({
				user: {
					phone
				}
			}))
		},
		skip,
		take: 10,
		include: {
			payment: true,
			products: {
				include: {
					product: true
				}
			},
			user: true
		},
		orderBy: {
			created_at: "desc"
		}
	}));
}

export async function changeOrderStatus(orderId: Order['id'],status: OrderStatus) {
	return await prisma.order.update({
		where: {
			id: orderId
		},
		data: {
			status
		}
	})
}

export async function getOrdersCount(status: OrderStatus | undefined, phone: number | undefined) {
	return await prisma.order.count(status ? ({
		where: {
			...(status && ({
				status
			})),
			...(phone && ({
				user: {
					phone
				}
			}))
		},
	}):{});
}
