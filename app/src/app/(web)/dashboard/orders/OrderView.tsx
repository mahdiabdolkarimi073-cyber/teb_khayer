"use client";

import {Badge, ScrollArea, Table} from "@mantine/core";
import {Order, OrderProduct, Payment, Product} from "@prisma/client";
import React from "react";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import Link from "next/link";

const OrderView = (props: {
	orders: (Order & {products: (OrderProduct & {product: Product})[], payment: Payment})[]
}) => {
	let {orders} = props;

	return (
		<div>
			<ScrollArea>
				<Table miw={700}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>شناسه</Table.Th>
							<Table.Th>قیمت</Table.Th>
							<Table.Th>تاریخ</Table.Th>
							<Table.Th>وضعیت</Table.Th>
							<Table.Th>محصولات</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{orders.map(order => (
						<Table.Tr key={order.id}>
							<Table.Td>{+order.id}</Table.Td>
							<Table.Td>{(+order.payment.amount).toLocaleString('fa')} تومان</Table.Td>
							<Table.Td>{(new Date(order.created_at)).toLocaleString('fa')}</Table.Td>
							<Table.Td>{OrderStatusEnum[order.status]}</Table.Td>
							<Table.Td className={'center gap-2 flex-col'}>
								{order.products.map(op => (
									<div>
										<Link href={`/product/${op.product.id}`}>
											{op.product.name}
										</Link>
										<Badge>
											{op.count}
										</Badge>
									</div>
								))}
							</Table.Td>
						</Table.Tr>
					))}</Table.Tbody>
				</Table>
			</ScrollArea>
		</div>
	)
}

export default OrderView;
