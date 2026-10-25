import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React from "react";
import OrderView from "@/app/(web)/dashboard/orders/OrderView";
import {ssrOptimize} from "@/utils/other";
import {OrderStatus} from "@prisma/client";

interface PageProps {
	params?: Promise<Record<string, string | string[]>> | Record<string, string | string[]>;
	searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

const Page = async (props: PageProps) => {
	const user = await getUserFromCookie();
	if (!user) return null;

	// Compatible with both Next.js 14 (object) and Next.js 15 (Promise)
	let resolvedParams: Record<string, string | string[] | undefined> = {};
	if (props?.searchParams) {
		try {
			resolvedParams = typeof (props.searchParams as any)?.then === "function" || props.searchParams instanceof Promise
				? await props.searchParams
				: props.searchParams;
		} catch {
			resolvedParams = {};
		}
	}

	const rawStatus = resolvedParams?.status;
	let statusStr = "";
	if (Array.isArray(rawStatus)) {
		statusStr = rawStatus.length > 0 && typeof rawStatus[0] === "string" ? rawStatus[0] : "";
	} else if (typeof rawStatus === "string") {
		statusStr = rawStatus;
	}
	const cleanStatus = statusStr.trim().toLowerCase();

	let activeFilter: "all" | "current" | "delivered" = "all";
	let statusFilter: any = undefined;

	if (cleanStatus === "current") {
		activeFilter = "current";
		// Any order that is NOT DELAY (includes PENDING, SENDED, CANCELED)
		statusFilter = {
			not: OrderStatus.DELAY
		};
	} else if (cleanStatus === "delivered") {
		activeFilter = "delivered";
		// Only DELAY (delivered to customer)
		statusFilter = OrderStatus.DELAY;
	} else {
		activeFilter = "all";
		statusFilter = undefined;
	}

	const [orders, currentCount, deliveredCount, allCount] = await Promise.all([
		prisma.order.findMany({
			where: {
				userId: user.id,
				...(statusFilter ? { status: statusFilter } : {})
			},
			include: {
				payment: true,
				user: true,
				products: {
					include: {
						product: true
					}
				}
			},
			orderBy: {
				created_at: "desc"
			}
		}),
		prisma.order.count({
			where: {
				userId: user.id,
				status: {
					not: OrderStatus.DELAY
				}
			}
		}),
		prisma.order.count({
			where: {
				userId: user.id,
				status: OrderStatus.DELAY
			}
		}),
		prisma.order.count({
			where: {
				userId: user.id
			}
		})
	]);

	return (
		<div>
			<OrderView
				orders={ssrOptimize(orders || [])}
				activeFilter={activeFilter}
				counts={{
					all: allCount || 0,
					current: currentCount || 0,
					delivered: deliveredCount || 0
				}}
			/>
		</div>
	);
};

export default Page;
