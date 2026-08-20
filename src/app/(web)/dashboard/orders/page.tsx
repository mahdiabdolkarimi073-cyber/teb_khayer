import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {ScrollArea, Table} from "@mantine/core";
import React from "react";
import OrderView from "@/app/(web)/dashboard/orders/OrderView";
import {ssrOptimize} from "@/utils/other";

const Page = async (props: any) => {
	const user = await getUserFromCookie();
	if (!user) return null;
	console.log(await prisma.orderProduct.findMany())
	const orders = await prisma.order.findMany({
		where: {
			userId: user?.id
		},
		include: {
			payment: true,
			products: {
				include: {
					product: true
				}
			}
		},
		orderBy: {
			created_at: "desc"
		}
	});
	return (
		<div>
			<h3>سفارشات</h3>
			<OrderView orders={ssrOptimize(orders)} />
		</div>
	)
}

export default Page;
