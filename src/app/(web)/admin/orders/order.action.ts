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

export async function updateOrderTrackingCode(orderId: number, trackingCode: string, shippingCompany = "پست پیشتاز") {
	const order = await prisma.order.findUnique({ where: { id: orderId } });
	if (!order) return { success: false, message: "سفارش یافت نشد" };

	let info: any = {};
	try {
		info = typeof order.info === "string" ? JSON.parse(order.info as string) : (order.info || {});
	} catch {
		info = {};
	}

	info.trackingCode = trackingCode.trim();
	info.shippingCompany = shippingCompany.trim();
	info.shippedAt = new Date().toISOString();

	await prisma.order.update({
		where: { id: orderId },
		data: {
			info,
			status: OrderStatus.SENDED
		}
	});

	return { success: true, message: "کد رهگیری با موفقیت ثبت و وضعیت سفارش به «ارسال شده» تغییر یافت." };
}

