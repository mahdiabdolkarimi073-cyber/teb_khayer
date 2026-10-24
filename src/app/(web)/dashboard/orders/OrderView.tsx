"use client";

import {Badge, ScrollArea, Table} from "@mantine/core";
import {Order, OrderProduct, Payment, Product} from "@prisma/client";
import React from "react";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import Link from "next/link";
import {
	IconArrowLeft,
	IconCircleCheck,
	IconClock,
	IconListDetails,
	IconPackageOff,
	IconTruckDelivery,
	IconAlertTriangle
} from "@tabler/icons-react";
import {formatPersianCurrency, formatPersianNumber, toPersianDateTime} from "@/utils/format";

type OrderItem = Order & {
	products?: (OrderProduct & {product?: Product | null})[];
	payment?: Payment | null;
};

interface OrderViewProps {
	orders?: OrderItem[];
	activeFilter?: "all" | "current" | "delivered";
	counts?: {
		all: number;
		current: number;
		delivered: number;
	};
}

const OrderView = ({orders = [], activeFilter = "all", counts}: OrderViewProps) => {
	const orderList = Array.isArray(orders) ? orders : [];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "DELAY":
				return <Badge color="green" variant="light" size="md">تحویل داده شده</Badge>;
			case "SENDED":
				return <Badge color="blue" variant="light" size="md">ارسال شده</Badge>;
			case "PENDING":
				return <Badge color="yellow" variant="light" size="md">در حال آماده‌سازی</Badge>;
			case "CANCELED":
				return <Badge color="red" variant="light" size="md">لغو شده</Badge>;
			default:
				return (
					<Badge color="gray" variant="light" size="md">
						{OrderStatusEnum[status as keyof typeof OrderStatusEnum] || status || "نامشخص"}
					</Badge>
				);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
				<div>
					<h3 className="text-xl font-bold text-gray-800">لیست سفارشات</h3>
					<p className="text-xs text-gray-500 mt-1">مشاهده وضعیت و تاریخچه خریدهای شما در طِب خیّر</p>
				</div>
			</div>

			{/* Category Filter Tabs */}
			<div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
				<Link
					href="/dashboard/orders"
					className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
						activeFilter === "all"
							? "bg-blue-600 text-white shadow-xs"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}
				>
					<IconListDetails size={16} />
					<span>همه سفارشات</span>
					{counts?.all !== undefined && (
						<span
							className={`text-xs px-2 py-0.5 rounded-full font-bold ${
								activeFilter === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
							}`}
						>
							{formatPersianNumber(counts.all || 0)}
						</span>
					)}
				</Link>

				<Link
					href="/dashboard/orders?status=current"
					className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
						activeFilter === "current"
							? "bg-blue-600 text-white shadow-xs"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}
				>
					<IconClock size={16} />
					<span>سفارش‌های جاری</span>
					{counts?.current !== undefined && (
						<span
							className={`text-xs px-2 py-0.5 rounded-full font-bold ${
								activeFilter === "current" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
							}`}
						>
							{formatPersianNumber(counts.current || 0)}
						</span>
					)}
				</Link>

				<Link
					href="/dashboard/orders?status=delivered"
					className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
						activeFilter === "delivered"
							? "bg-blue-600 text-white shadow-xs"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}
				>
					<IconCircleCheck size={16} />
					<span>تحویل داده شده</span>
					{counts?.delivered !== undefined && (
						<span
							className={`text-xs px-2 py-0.5 rounded-full font-bold ${
								activeFilter === "delivered" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
							}`}
						>
							{formatPersianNumber(counts.delivered || 0)}
						</span>
					)}
				</Link>
			</div>

			{/* Empty State */}
			{orderList.length === 0 ? (
				<div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-300 my-4">
					<div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
						<IconPackageOff size={32} />
					</div>
					<h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
						{activeFilter === "current"
							? "هیچ سفارش جاری وجود ندارد"
							: activeFilter === "delivered"
							? "هیچ سفارش تحویل داده شده‌ای وجود ندارد"
							: "هیچ سفارشی ثبت نشده است"}
					</h4>
					<p className="text-sm text-gray-500 mb-6 max-w-sm">
						{activeFilter === "current"
							? "در حال حاضر هیچ سفارشی در مرحله آماده‌سازی، ارسال یا لغو شده ندارید."
							: activeFilter === "delivered"
							? "تاکنون هیچ سفارشی با وضعیت تحویل شده در حساب شما ثبت نشده است."
							: "شما هنوز خریدی در سامانه طِب خیّر ثبت نکرده‌اید."}
					</p>
					<Link
						href="/category/all"
						className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-xs"
					>
						<span>مشاهده محصولات فروشگاه</span>
						<IconArrowLeft size={16} />
					</Link>
				</div>
			) : (
				/* Orders Table */
				<ScrollArea className="border rounded-xl shadow-xs">
					<Table miw={700} striped highlightOnHover verticalSpacing="sm">
						<Table.Thead className="bg-gray-50">
							<Table.Tr>
								<Table.Th className="text-right">شناسه</Table.Th>
								<Table.Th className="text-right">مبلغ پرداختی</Table.Th>
								<Table.Th className="text-right">تاریخ ثبت</Table.Th>
								<Table.Th className="text-right">وضعیت</Table.Th>
								<Table.Th className="text-right">محصولات</Table.Th>
								<Table.Th className="text-right">پیگیری</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{orderList.map((order) => {
								const orderProducts = Array.isArray(order?.products) ? order.products : [];
								const paymentAmount = Number(order?.payment?.amount || 0);

								return (
									<Table.Tr key={order?.id != null ? order.id : Math.random()}>
										<Table.Td className="font-bold text-gray-800">
											#{formatPersianNumber(Number(order?.id || 0))}
										</Table.Td>
										<Table.Td className="font-semibold text-blue-600">
											{formatPersianCurrency(paymentAmount)}
										</Table.Td>
										<Table.Td className="text-xs text-gray-600">
											{order?.created_at ? toPersianDateTime(order.created_at) : "نامشخص"}
										</Table.Td>
										<Table.Td>{getStatusBadge(order?.status || "")}</Table.Td>
										<Table.Td>
											{orderProducts.length === 0 ? (
												<span className="text-xs text-gray-400">فاقد محصول</span>
											) : (
												<div className="flex flex-col gap-1.5 max-w-[260px]">
													{orderProducts.map((op, idx) => {
														const product = op?.product;
														const productName = product?.name || `محصول ناموجود (کد: ${op?.productId || op?.id || idx})`;
														const productId = product?.id || op?.productId;
														const count = Number(op?.count || 1);

														// 100% safe image access: NEVER access [0] without verifying array existence and length
														const hasImages = Array.isArray(product?.images) && product.images.length > 0;
														const firstImage = hasImages && typeof product?.images?.[0] === "string"
															? product.images[0]
															: "/empty.png";

														return (
															<div
																key={op?.id != null ? op.id : idx}
																className="flex items-center justify-between gap-2 text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100"
															>
																<div className="flex items-center gap-1.5 min-w-0 flex-1">
																	<img
																		src={firstImage}
																		alt={productName}
																		className="w-6 h-6 rounded object-cover flex-shrink-0"
																		onError={(e) => {
																			(e.currentTarget as HTMLImageElement).src = "/empty.png";
																		}}
																	/>
																	{productId ? (
																		<Link
																			href={`/product/${productId}`}
																			className="text-blue-600 hover:underline truncate"
																			title={productName}
																		>
																			{productName}
																		</Link>
																	) : (
																		<span className="text-gray-500 truncate" title={productName}>
																			{productName}
																		</span>
																	)}
																</div>
																<Badge size="xs" variant="light" color="blue" className="flex-shrink-0">
																	{formatPersianNumber(count)} عدد
																</Badge>
															</div>
														);
													})}
												</div>
											)}
										</Table.Td>
										<Table.Td>
											{order?.id != null ? (
												<Link
													href={`/track?orderId=${order.id}`}
													className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
												>
													<IconTruckDelivery size={14} />
													<span>رهگیری</span>
												</Link>
											) : (
												<span className="text-gray-400 text-xs">-</span>
											)}
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				</ScrollArea>
			)}
		</div>
	);
};

export default OrderView;
