"use server";

import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { ensureCRMTables } from "@/backend/modules/crm/crmDb";
import { ssrOptimize } from "@/utils/other";

export interface SupportTicketItem {
  id: number;
  ticketNumber: string;
  userId: string;
  userName: string | null;
  userPhone: string | null;
  orderId: number | null;
  type: "QUESTION" | "ORDER_ISSUE" | "COMPLAINT" | "REFUND" | "SUGGESTION";
  subject: string;
  message: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
  adminReply: string | null;
  adminRepliedAt: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserSupportTickets(): Promise<SupportTicketItem[]> {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user) return [];

  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "SupportTicket" WHERE "userId" = $1 ORDER BY "created_at" DESC`,
      user.id
    );

    return ssrOptimize(
      rows.map((r) => ({
        ...r,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        adminRepliedAt: r.adminRepliedAt ? new Date(r.adminRepliedAt).toISOString() : null,
      }))
    );
  } catch (err) {
    console.error("Error fetching support tickets:", err);
    return [];
  }
}

export async function createSupportTicket(formData: {
  subject: string;
  message: string;
  type: string;
  priority?: string;
  orderId?: number | null;
}) {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user) {
    return { success: false, message: "لطفاً ابتدا وارد حساب کاربری خود شوید." };
  }

  const { subject, message, type, priority = "NORMAL", orderId = null } = formData;

  if (!subject?.trim() || !message?.trim()) {
    return { success: false, message: "موضوع و متن پیام الزامی هستند." };
  }

  const ticketNumber = `TK-${Date.now().toString().slice(-6)}`;

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SupportTicket" 
       ("ticketNumber", "userId", "userName", "userPhone", "orderId", "type", "subject", "message", "priority", "status", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', now(), now())`,
      ticketNumber,
      user.id,
      user.name || "کاربر",
      user.phone ? `0${user.phone}` : "",
      orderId ? Number(orderId) : null,
      type || "QUESTION",
      subject.trim(),
      message.trim(),
      priority || "NORMAL"
    );

    return {
      success: true,
      message: `درخواست شما با شناسه پیگیری ${ticketNumber} ثبت شد. کارشناسان ما به زودی پاسخ خواهند داد.`,
      ticketNumber,
    };
  } catch (err) {
    console.error("Error creating ticket:", err);
    return { success: false, message: "خطا در ثبت درخواست پشتیبانی. لطفاً دوباره تلاش فرمایید." };
  }
}

export async function getUserOrdersForTicket() {
  const user = await getUserFromCookie();
  if (!user) return [];

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      created_at: true,
      payment: {
        select: { amount: true },
      },
    },
    orderBy: { created_at: "desc" },
    take: 10,
  });

  return ssrOptimize(
    orders.map((o) => ({
      id: o.id,
      status: o.status,
      date: o.created_at.toISOString(),
      amount: o.payment?.amount || 0,
    }))
  );
}

// ADMIN ACTIONS
export async function getAdminSupportTickets(statusFilter?: string): Promise<SupportTicketItem[]> {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") return [];

  try {
    let query = `SELECT * FROM "SupportTicket"`;
    const params: any[] = [];
    if (statusFilter && statusFilter !== "ALL") {
      query += ` WHERE "status" = $1`;
      params.push(statusFilter);
    }
    query += ` ORDER BY "created_at" DESC LIMIT 100`;

    const rows = await prisma.$queryRawUnsafe<any[]>(query, ...params);

    return ssrOptimize(
      rows.map((r) => ({
        ...r,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        adminRepliedAt: r.adminRepliedAt ? new Date(r.adminRepliedAt).toISOString() : null,
      }))
    );
  } catch (err) {
    console.error("Error fetching admin support tickets:", err);
    return [];
  }
}

export async function adminReplyTicket(ticketId: number, replyText: string, newStatus = "ANSWERED") {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "دسترسی غیرمجاز" };
  }

  if (!replyText?.trim()) {
    return { success: false, message: "متن پاسخ الزامی است" };
  }

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "SupportTicket" 
       SET "adminReply" = $1, "adminRepliedAt" = now(), "status" = $2, "updated_at" = now()
       WHERE "id" = $3`,
      replyText.trim(),
      newStatus,
      ticketId
    );

    return { success: true, message: "پاسخ با موفقیت برای کاربر ارسال شد." };
  } catch (err) {
    console.error("Error replying to ticket:", err);
    return { success: false, message: "خطا در ثبت پاسخ تیکت." };
  }
}
