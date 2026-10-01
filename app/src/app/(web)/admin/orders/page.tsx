"use client";

import {changeOrderStatus, getAllOrders, getOrdersCount} from "@/app/(web)/admin/orders/order.action";
import {ActionIcon, Badge, Button, NumberInput, Pagination, ScrollArea, Select, Table, TextInput} from "@mantine/core";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import React, {useEffect, useState} from "react";
import {useAction} from "@/utils/server";
import Loading from "@/app/(app)/loading";
import Link from "next/link";
import {IconExchange} from "@tabler/icons-react";
import {closeLastModal, modal} from "@/utils/modal";
import {OrderStatus} from "@prisma/client";
import {CheckoutFields} from "@/app/(web)/dashboard/checkout/checkout.fields";
import {formatPersianCurrency, toPersianDateTime} from "@/utils/format";


const AdminOrderView = () => {
	const [skip, setSkip] = useState(0);
	const [phone, setPhone] = useState<number | undefined>();
	const [status, setStatus] = useState<OrderStatus>();
	const {result: orders, isPending, refetch} = useAction(getAllOrders, skip, status, phone);
	const {result: count, isPending: isP1} = useAction(getOrdersCount, status, phone);


	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap gap-3 items-end">
				<div className="min-w-[160px] flex-1">
					<Select
						label={'فیلتر وضعیت'}
						value={status}
						onChange={(e) => setStatus(e as OrderStatus)}
						data={Object.entries(OrderStatusEnum).map(([key, name]) => ({
							label: name,
							value: key
						}))}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<NumberInput
						label={'جستجو'}
						placeholder={'شماره تلفن...'}
						onChange={(e)=>{
							if ((e+"").length >= 10) setPhone(+(e));
						}}
					/>
				</div>
			</div>
			<br/>
			{isPending || isP1 ? (
				<Loading />
			):(
				<>
					<ScrollArea>
						<Table miw={700} striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>شناسه</Table.Th>
									<Table.Th>کاربر</Table.Th>
									<Table.Th>قیمت</Table.Th>
									<Table.Th>تاریخ</Table.Th>
									<Table.Th>وضعیت</Table.Th>
									<Table.Th>محصولات</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>{orders?.map?.(order => (
								<Table.Tr key={order.id+order.status}>
									<Table.Td>{order.id}</Table.Td>
									<Table.Td>{order.user.name} ({order.user.phone})</Table.Td>
									<Table.Td>{formatPersianCurrency(+order.payment.amount)}</Table.Td>
									<Table.Td>{toPersianDateTime(order.created_at)}</Table.Td>
									<Table.Td key={order.status}>
										<div className={'center gap-1'}>
											<small>{OrderStatusEnum[order.status]}</small>
											<ActionIcon onClick={()=>{
												modal("تغییر وضعیت تراکنش", (
													<div>
														<b>وضعیت فعلی: {OrderStatusEnum[order.status]} - {formatPersianCurrency(+order.payment.amount)}</b>
														<hr className={'my-2'}/>
														<div className={'border rounded p-1 my-1'}>
															{Object.entries(CheckoutFields).map(([key, name]) => (
																<div key={key} className={'my-1'}>
																	<b>{name}</b>: {order.info?.[key as keyof typeof order.info] || "نامشخص"}
																</div>
															))}
															<br/>
															<b>محصولات:</b>
															{order.products.map(op => (
																<div key={op.product.id} className={'w-full center justify-between'}>
																	<Link href={`/product/${op.product.id}`}>
																		{op.product.name}
																	</Link>
																	<Badge>
																		{op.count} عدد
																	</Badge>
																</div>
															))}
														</div>
														<br/>
														<p>وضعیت فعلی تراکنش کاربر {order.user.name} را انتخاب کنید</p>
														<div className={'center flex-col gap-2'}>
															{Object.entries(OrderStatusEnum).map(([key, name]) => (
																<Button key={key} fullWidth onClick={()=>{
																	changeOrderStatus(order.id, key as OrderStatus)
																		.then(refetch)
																		.finally(closeLastModal)
																}}>
																	{name}
																</Button>
															))}
														</div>
													</div>
												), {
													size: "lg"
												})
											}} size={'xs'}><IconExchange/></ActionIcon>
										</div>
									</Table.Td>
									<Table.Td className={'center gap-2 flex-col'}>
										{order.products.map(op => (
											<div key={op.product.id}>
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
					<br/>
					<div className="flex justify-center">
						<Pagination total={Math.ceil((count || 0) / 10)} value={Math.max(Math.floor(skip / 10) + 1, 1)}
								  onChange={(page) => setSkip((page - 1) * 10)}/>
					</div>
				</>
			)}
		</div>
	)
}

export default AdminOrderView;
