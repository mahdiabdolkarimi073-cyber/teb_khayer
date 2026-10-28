import React from "react";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { redirect } from "next/navigation";
import {
  getUserSupportTickets,
  getUserOrdersForTicket,
  getSupportWorkingHoursInfo,
  getSupportFAQs,
} from "./support.action";
import SupportView from "./SupportView";

export default async function SupportPage() {
  const user = await getUserFromCookie();
  if (!user) {
    redirect("/auth/login");
  }

  const [tickets, orders, hoursInfo, faqs] = await Promise.all([
    getUserSupportTickets(),
    getUserOrdersForTicket(),
    getSupportWorkingHoursInfo(),
    getSupportFAQs(),
  ]);

  return (
    <SupportView
      initialTickets={tickets}
      userOrders={orders}
      hoursInfo={hoursInfo}
      initialFaqs={faqs}
    />
  );
}
