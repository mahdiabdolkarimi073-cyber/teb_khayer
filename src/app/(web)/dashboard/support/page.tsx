import React from "react";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { redirect } from "next/navigation";
import { getUserSupportTickets, getUserOrdersForTicket } from "./support.action";
import SupportView from "./SupportView";

export default async function SupportPage() {
  const user = await getUserFromCookie();
  if (!user) {
    redirect("/auth/login");
  }

  const [tickets, orders] = await Promise.all([
    getUserSupportTickets(),
    getUserOrdersForTicket(),
  ]);

  return <SupportView initialTickets={tickets} userOrders={orders} />;
}
