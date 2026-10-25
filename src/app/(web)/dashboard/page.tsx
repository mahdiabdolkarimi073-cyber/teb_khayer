import React from "react";
import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { redirect } from "next/navigation";
import { getUserSupportTickets } from "@/app/(web)/dashboard/support/support.action";
import { getLastSuccessfulLogin } from "@/backend/modules/crm/loginTracker";
import DashboardHomeView from "./DashboardHomeView";
import { ssrOptimize } from "@/utils/other";

export default async function DashboardPage() {
  const user = await getUserFromCookie();
  if (!user) {
    redirect("/auth/login");
  }

  const [orders, addressesCount, tickets, lastLogin] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: {
        payment: true,
        products: {
          include: { product: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: 6,
    }),
    prisma.userAddress.count({
      where: { userId: user.id },
    }),
    getUserSupportTickets(),
    getLastSuccessfulLogin(user.id),
  ]);

  return (
    <DashboardHomeView
      user={ssrOptimize(user)}
      orders={ssrOptimize(orders || [])}
      addressesCount={addressesCount || 0}
      tickets={ssrOptimize(tickets || [])}
      lastLogin={lastLogin}
    />
  );
}
