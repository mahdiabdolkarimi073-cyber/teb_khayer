"use client";

import {Badge, ScrollArea, Table} from "@mantine/core";
import {Order, OrderProduct, Payment, Product} from "@prisma/client";
import React, {useState} from "react";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
	IconArrowLeft,
	IconCircleCheck,
	IconClock,
	IconListDetails,
	IconPackageOff,
	IconTruckDelivery,
	IconAlertTriangle,
	IconFileText,
	IconRefresh,
	IconBarcode,
	IconCopy,
	IconCheck,
	IconExternalLink,
	IconShoppingCart,
	IconX
} from "@tabler/icons-react";
import {formatPersianCurrency, formatPersianNumber, toPersianDateTime} from "@/utils/format";
import OrderInvoiceModal from "@/app/(web)/dashboard/orders/OrderInvoiceModal";
import {reorderPastOrder, ReorderResponse} from "./reorder.action";
import {bulkSetLocalCart} from "@/utils/localCart";

type OrderItem = Order & {
	products?: (OrderProduct & {product?: Product | null})[];
	payment?: Payment | null;
	user?: any;
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
	const router = useRouter();
	const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
	const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
	const [reorderLoadingId, setReorderLoadingId] = useState<number | null>(null);
	const [reorderResult, setReorderResult] = useState<ReorderResponse | null>(null);

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

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedTracking(text);
		setTimeout(() => setCopiedTracking(null), 2500);
	};

	const handleReorder = async (orderId: number) => {
		setReorderLoadingId(orderId);
		try {
			const res = await reorderPastOrder(orderId);
			setReorderResult(res);

			// If there are available items, add them into the cart
			if (res.success && res.items.length > 0) {
				const availableItems = res.items
					.filter((item) => item.isAvailable && item.availableCount > 0)
					.map((item) => ({
						product: {
							id: item.productId,
							name: item.name,
							price: item.currentPrice,
						} as Partial<Product>,
						quantity: item.availableCount,
					}));

				if (availableItems.length > 0) {
					bulkSetLocalCart(availableItems);
				}
			}
		} catch (e) {
			alert("بررسی سفارش برای خرید مجدد با خطا مواجه شد.");
		} finally {
			setReorderLoadingId(null);
		}
	};

	return (
		<div className="flex flex-col gap-4" dir="rtl">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
				<div>
					<h3 className="text-xl font-bold text-gray-800">لیست سفارشات من</h3>
					<p className="text-xs text-gray-500 mt-1">مشاهده وضعیت، کد رهگیری پستی، فاکتور و خرید مجدد اقلام</p>
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
					<Table miw={820} striped highlightOnHover verticalSpacing="sm">
						<Table.Thead className="bg-gray-50">
							<Table.Tr>
								<Table.Th className="text-right">شناسه</Table.Th>
								<Table.Th className="text-right">مبلغ پرداختی</Table.Th>
								<Table.Th className="text-right">تاریخ ثبت</Table.Th>
								<Table.Th className="text-right">وضعیت سفارش</Table.Th>
								<Table.Th className="text-right">کد رهگیری مرسوله پستی</Table.Th>
								<Table.Th className="text-right">اقلام</Table.Th>
								<Table.Th className="text-right">فاکتور</Table.Th>
								<Table.Th className="text-center">خرید مجدد</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{orderList.map((order) => {
								const orderProducts = Array.isArray(order?.products) ? order.products : [];
								const paymentAmount = Number(order?.payment?.amount || 0);

								let rawInfo: any = {};
								try {
									rawInfo = typeof order.info === "string" ? JSON.parse(order.info) : (order.info || {});
								} catch {
									rawInfo = {};
								}

								const trackingCode = rawInfo?.trackingCode || rawInfo?.postalCode || rawInfo?.trackingBarcode || rawInfo?.postTracking;
								const postCompany = rawInfo?.shippingCompany || rawInfo?.postCompany || "شرکت ملی پست";

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

										{/* Postal Tracking Column */}
										<Table.Td>
											{trackingCode ? (
												<div className="flex flex-col gap-1 text-xs">
													<div className="flex items-center gap-1.5 font-mono bg-blue-50/80 px-2 py-1 rounded border border-blue-200">
														<IconBarcode size={15} className="text-blue-600 flex-shrink-0" />
														<span className="font-bold text-gray-800">{trackingCode}</span>
														<button
															type="button"
															onClick={() => copyToClipboard(trackingCode)}
															className="text-gray-500 hover:text-blue-600 p-0.5 rounded transition"
															title="کپی کد رهگیری"
														>
															{copiedTracking === trackingCode ? (
																<IconCheck size={14} className="text-emerald-600" />
															) : (
																<IconCopy size={14} />
															)}
														</button>
													</div>
													<a
														href={`https://tracking.post.ir/?id=${trackingCode}`}
														target="_blank"
														rel="noreferrer"
														className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 hover:underline"
													>
														<span>رهگیری در سامانه پست</span>
														<IconExternalLink size={12} />
													</a>
												</div>
											) : order.status === "SENDED" || order.status === "DELAY" ? (
												<span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
													تحویل پست شد (کد پیامک می‌شود)
												</span>
											) : (
												<span className="text-xs text-gray-400">در انتظار ارسال</span>
											)}
										</Table.Td>

										{/* Items list */}
										<Table.Td>
											{orderProducts.length === 0 ? (
												<span className="text-xs text-gray-400">فاقد محصول</span>
											) : (
												<div className="flex flex-col gap-1.5 max-w-[220px]">
													{orderProducts.map((op, idx) => {
														const product = op?.product;
														const productName = product?.name || `محصول (کد: ${op?.productId || op?.id || idx})`;
														const productId = product?.id || op?.productId;
														const count = Number(op?.count || 1);

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

										{/* Invoice action */}
										<Table.Td>
											<button
												type="button"
												onClick={() => setSelectedInvoiceOrder(order)}
												className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition ${
													order?.status === "PENDING"
														? "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
														: "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
												}`}
											>
												<IconFileText size={14} />
												<span>{order?.status === "PENDING" ? "پیش‌فاکتور" : "فاکتور خرید"}</span>
											</button>
										</Table.Td>

										{/* Re-order Action */}
										<Table.Td className="text-center">
											<button
												type="button"
												onClick={() => handleReorder(order.id)}
												disabled={reorderLoadingId === order.id}
												className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 transition shadow-2xs"
												title="بررسی موجودی روز و افزودن مجدد به سبد خرید"
											>
												<IconRefresh size={14} className={reorderLoadingId === order.id ? "animate-spin" : ""} />
												<span>{reorderLoadingId === order.id ? "بررسی..." : "خرید مجدد"}</span>
											</button>
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				</ScrollArea>
			)}

			{/* Invoice Modal */}
			{selectedInvoiceOrder && (
				<OrderInvoiceModal
					order={selectedInvoiceOrder}
					onClose={() => setSelectedInvoiceOrder(null)}
				/>
			)}

			{/* Re-order Result Modal */}
			{reorderResult && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
					onClick={() => setReorderResult(null)}
				>
					<div
						className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-6 space-y-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between pb-3 border-b border-gray-200">
							<div className="flex items-center gap-2 text-indigo-600">
								<IconShoppingCart size={22} />
								<h3 className="font-bold text-gray-900 text-base">نتیجه بررسی خرید مجدد</h3>
							</div>
							<button
								type="button"
								onClick={() => setReorderResult(null)}
								className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
							>
								<IconX size={20} />
							</button>
						</div>

						<p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
							{reorderResult.message}
						</p>

						{/* Items breakdown */}
						<div className="space-y-2 max-h-60 overflow-y-auto border border-gray-100 rounded-xl p-2 bg-gray-50/70 text-xs">
							{reorderResult.items.map((item) => (
								<div
									key={item.productId}
									className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-gray-200"
								>
									<div className="flex items-center gap-2 min-w-0 flex-1">
										<img
											src={item.image}
											alt={item.name}
											className="w-8 h-8 rounded object-cover flex-shrink-0"
										/>
										<div className="min-w-0">
											<p className="font-bold text-gray-900 truncate">{item.name}</p>
											<p className="text-[11px] text-gray-500">
												تعداد درخواستی: {formatPersianNumber(item.requestedCount)} عدد
											</p>
										</div>
									</div>

									<div className="text-left flex-shrink-0">
										{item.isAvailable ? (
											<div>
												<span className="text-xs font-bold text-emerald-700 block">
													{formatPersianCurrency(item.currentPrice)}
												</span>
												{item.priceChanged && (
													<span className="text-[10px] text-amber-600 block">
														(قیمت روز به‌روزرسانی شد)
													</span>
												)}
											</div>
										) : (
											<span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
												ناموجود
											</span>
										)}
									</div>
								</div>
							))}
						</div>

						{/* Action Buttons */}
						<div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
							<button
								type="button"
								onClick={() => setReorderResult(null)}
								className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-bold transition"
							>
								بستن
							</button>
							{reorderResult.success && (
								<button
									type="button"
									onClick={() => {
										setReorderResult(null);
										router.push("/dashboard/cart");
									}}
									className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
								>
									<IconShoppingCart size={16} />
									<span>مشاهده سبد خرید و تکمیل سفارش</span>
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrderView;
