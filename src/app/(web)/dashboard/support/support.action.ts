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
  messagesCount?: number;
}

export interface SupportMessageItem {
  id: number;
  ticketId: number;
  senderRole: "USER" | "ADMIN";
  senderName: string | null;
  message: string;
  created_at: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  created_at: string;
}

/**
 * Returns Iranian standard working hours status:
 * Saturday - Wednesday: 09:00 - 18:00
 * Thursday: 09:00 - 13:00
 * Friday: Closed
 */
export async function getSupportWorkingHoursInfo() {
  const now = new Date();
  // Iran time zone: UTC+3:30
  const iranOffsetMinutes = 3.5 * 60;
  const utcMinutes = now.getTime() + now.getTimezoneOffset() * 60000;
  const iranDate = new Date(utcMinutes + iranOffsetMinutes * 60000);

  const dayOfWeek = iranDate.getDay(); // 0 is Sunday, 6 is Saturday
  const hours = iranDate.getHours();
  const minutes = iranDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Iran days: 6: Saturday, 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday
  let isOpen = false;
  let nextOpenTime = "شنبه ساعت ۹:۰۰ صبح";

  if (dayOfWeek >= 0 && dayOfWeek <= 3 || dayOfWeek === 6) {
    // Saturday to Wednesday (9:00 to 18:00)
    if (timeInMinutes >= 9 * 60 && timeInMinutes < 18 * 60) {
      isOpen = true;
    } else if (timeInMinutes < 9 * 60) {
      nextOpenTime = "امروز ساعت ۹:۰۰ صبح";
    } else {
      nextOpenTime = dayOfWeek === 3 ? "فردا (پنج‌شنبه) ساعت ۹:۰۰ صبح" : "فردا ساعت ۹:۰۰ صبح";
    }
  } else if (dayOfWeek === 4) {
    // Thursday (9:00 to 13:00)
    if (timeInMinutes >= 9 * 60 && timeInMinutes < 13 * 60) {
      isOpen = true;
    } else if (timeInMinutes < 9 * 60) {
      nextOpenTime = "امروز ساعت ۹:۰۰ صبح";
    } else {
      nextOpenTime = "شنبه ساعت ۹:۰۰ صبح";
    }
  } else if (dayOfWeek === 5) {
    // Friday
    isOpen = false;
    nextOpenTime = "فردا (شنبه) ساعت ۹:۰۰ صبح";
  }

  return {
    isOpen,
    nextOpenTime,
    workingHoursText: "شنبه تا چهارشنبه ۹:۰۰ الی ۱۸:۰۰ | پنج‌شنبه ۹:۰۰ الی ۱۳:۰۰",
    averageResponseTime: "میانگین زمان پاسخگویی: ۱ الی ۳ ساعت کاری",
    closedNotice:
      "شما در حال ثبت پیام در خارج از ساعات کاری هستید. درخواست شما در اولین ساعات کاری روز بعد بررسی و پاسخ داده خواهد شد.",
  };
}

export async function getUserSupportTickets(): Promise<SupportTicketItem[]> {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user) return [];

  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT t.*, 
        (SELECT count(*) FROM "SupportMessage" m WHERE m."ticketId" = t."id") as "messagesCount"
       FROM "SupportTicket" t 
       WHERE t."userId" = $1 
       ORDER BY t."created_at" DESC`,
      user.id
    );

    return ssrOptimize(
      rows.map((r) => ({
        ...r,
        messagesCount: Number(r.messagesCount || 0),
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
    return { success: false, message: "موضوع و شرح درخواست الزامی هستند." };
  }

  // Unique dedicated tracking number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `TK-${Date.now().toString().slice(-4)}${randomSuffix}`;

  try {
    const insertRes = await prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO "SupportTicket" 
       ("ticketNumber", "userId", "userName", "userPhone", "orderId", "type", "subject", "message", "priority", "status", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', now(), now())
       RETURNING "id"`,
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

    const ticketId = insertRes?.[0]?.id;

    if (ticketId) {
      // Record initial message into conversation thread
      await prisma.$executeRawUnsafe(
        `INSERT INTO "SupportMessage" ("ticketId", "senderRole", "senderName", "message", "created_at")
         VALUES ($1, 'USER', $2, $3, now())`,
        ticketId,
        user.name || "کاربر",
        message.trim()
      );

      // Log activity
      await prisma.$executeRawUnsafe(
        `INSERT INTO "CustomerActivityLog" ("userId", "action", "details", "actor", "created_at")
         VALUES ($1, 'ثبت تیکت پشتیبانی', $2, 'مشتری', now())`,
        user.id,
        `شماره پیگیری: ${ticketNumber} - موضوع: ${subject.trim()}`
      );
    }

    const hoursInfo = await getSupportWorkingHoursInfo();

    return {
      success: true,
      message: `درخواست شما با شماره پیگیری اختصاصی ${ticketNumber} با موفقیت ثبت شد. ${
        hoursInfo.isOpen ? "کارشناسان ما به زودی پاسخ خواهند داد." : hoursInfo.closedNotice
      }`,
      ticketNumber,
      ticketId,
    };
  } catch (err) {
    console.error("Error creating ticket:", err);
    return { success: false, message: "خطا در ثبت درخواست پشتیبانی. لطفاً دوباره تلاش فرمایید." };
  }
}

export async function getTicketMessages(ticketId: number): Promise<SupportMessageItem[]> {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user) return [];

  try {
    // Verify user owns the ticket or is admin
    if (user.role !== "ADMIN") {
      const ticket = await prisma.$queryRawUnsafe<any[]>(
        `SELECT "id" FROM "SupportTicket" WHERE "id" = $1 AND "userId" = $2`,
        ticketId,
        user.id
      );
      if (!ticket || ticket.length === 0) return [];
    }

    const messages = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "SupportMessage" WHERE "ticketId" = $1 ORDER BY "created_at" ASC`,
      ticketId
    );

    return ssrOptimize(
      messages.map((m) => ({
        id: m.id,
        ticketId: m.ticketId,
        senderRole: m.senderRole,
        senderName: m.senderName,
        message: m.message,
        created_at: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
      }))
    );
  } catch (err) {
    console.error("Error fetching ticket messages:", err);
    return [];
  }
}

export async function addTicketMessage(ticketId: number, messageText: string) {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user) {
    return { success: false, message: "ابتدا وارد حساب خود شوید." };
  }

  if (!messageText?.trim()) {
    return { success: false, message: "متن پیام الزامی است." };
  }

  try {
    // Check ticket
    const ticketRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "SupportTicket" WHERE "id" = $1`,
      ticketId
    );
    if (!ticketRows || ticketRows.length === 0) {
      return { success: false, message: "تیکت یافت نشد." };
    }
    const ticket = ticketRows[0];

    // Access check
    if (user.role !== "ADMIN" && ticket.userId !== user.id) {
      return { success: false, message: "دسترسی غیرمجاز" };
    }

    const isCustomer = user.role !== "ADMIN";
    const senderRole = isCustomer ? "USER" : "ADMIN";
    const senderName = isCustomer ? user.name || "کاربر" : "مدیریت طِب خیّر";

    // Insert message into thread
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SupportMessage" ("ticketId", "senderRole", "senderName", "message", "created_at")
       VALUES ($1, $2, $3, $4, now())`,
      ticketId,
      senderRole,
      senderName,
      messageText.trim()
    );

    // Update ticket status
    const newStatus = isCustomer ? "PENDING" : "ANSWERED";
    await prisma.$executeRawUnsafe(
      `UPDATE "SupportTicket" 
       SET "status" = $1, 
           ${!isCustomer ? `"adminReply" = $2, "adminRepliedAt" = now(),` : ""}
           "updated_at" = now()
       WHERE "id" = $3`,
      newStatus,
      !isCustomer ? messageText.trim() : null,
      ticketId
    );

    // If admin replied: notify customer via UserNotification & simulated/real SMS
    if (!isCustomer) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "UserNotification" ("userId", "title", "message", "link", "created_at")
         VALUES ($1, $2, $3, $4, now())`,
        ticket.userId,
        `پاسخ جدید به تیکت #${ticket.ticketNumber}`,
        `مدیریت طِب خیّر به درخواست پشتیبانی شما پاسخ داد: «${messageText.trim().slice(0, 80)}...»`,
        `/dashboard/support?ticket=${ticket.id}`
      );

      // Log SMS notification
      await prisma.$executeRawUnsafe(
        `INSERT INTO "CustomerActivityLog" ("userId", "action", "details", "actor", "created_at")
         VALUES ($1, 'ارسال پیامک اطلاع‌رسانی پاسخ تیکت', $2, 'سیستم', now())`,
        ticket.userId,
        `پیامک به ${ticket.userPhone || "شماره کاربر"}: تیکت #${ticket.ticketNumber} پاسخ داده شد.`
      );
    }

    return { success: true, message: "پیام شما با موفقیت ثبت شد." };
  } catch (err) {
    console.error("Error adding message to ticket:", err);
    return { success: false, message: "خطا در ارسال پیام." };
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
    take: 15,
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

// ================= FAQ ACTIONS =================

export async function getSupportFAQs(): Promise<FAQItem[]> {
  await ensureCRMTables();
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "SupportFAQ" WHERE "isActive" = true ORDER BY "sortOrder" ASC, "id" ASC`
    );

    return ssrOptimize(
      rows.map((r) => ({
        ...r,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }))
    );
  } catch (e) {
    console.error("Error fetching FAQs:", e);
    return [];
  }
}

export async function getAllAdminFAQs(): Promise<FAQItem[]> {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") return [];

  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "SupportFAQ" ORDER BY "sortOrder" ASC, "id" ASC`
    );

    return ssrOptimize(
      rows.map((r) => ({
        ...r,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }))
    );
  } catch (e) {
    console.error("Error fetching admin FAQs:", e);
    return [];
  }
}

export async function createSupportFAQ(data: {
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
}) {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") return { success: false, message: "دسترسی غیرمجاز" };

  if (!data.question?.trim() || !data.answer?.trim()) {
    return { success: false, message: "پرسش و پاسخ الزامی هستند." };
  }

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SupportFAQ" ("question", "answer", "category", "sortOrder", "isActive", "created_at")
       VALUES ($1, $2, $3, $4, true, now())`,
      data.question.trim(),
      data.answer.trim(),
      data.category?.trim() || "عمومی",
      Number(data.sortOrder || 0)
    );
    return { success: true, message: "پرسش متداول با موفقیت افزوده شد." };
  } catch (e) {
    console.error(e);
    return { success: false, message: "خطا در ثبت پرسش متداول." };
  }
}

export async function updateSupportFAQ(
  id: number,
  data: {
    question: string;
    answer: string;
    category?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") return { success: false, message: "دسترسی غیرمجاز" };

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "SupportFAQ" 
       SET "question" = $1, "answer" = $2, "category" = $3, "sortOrder" = $4, "isActive" = $5
       WHERE "id" = $6`,
      data.question.trim(),
      data.answer.trim(),
      data.category?.trim() || "عمومی",
      Number(data.sortOrder || 0),
      data.isActive !== undefined ? data.isActive : true,
      id
    );
    return { success: true, message: "پرسش متداول با موفقیت ویرایش شد." };
  } catch (e) {
    console.error(e);
    return { success: false, message: "خطا در ویرایش پرسش متداول." };
  }
}

export async function deleteSupportFAQ(id: number) {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") return { success: false, message: "دسترسی غیرمجاز" };

  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "SupportFAQ" WHERE "id" = $1`, id);
    return { success: true, message: "پرسش متداول حذف شد." };
  } catch (e) {
    console.error(e);
    return { success: false, message: "خطا در حذف پرسش متداول." };
  }
}

// ================= ADMIN TICKETS =================

export async function getAdminSupportTickets(statusFilter?: string): Promise<SupportTicketItem[]> {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") return [];

  try {
    let query = `SELECT t.*,
      (SELECT count(*) FROM "SupportMessage" m WHERE m."ticketId" = t."id") as "messagesCount"
      FROM "SupportTicket" t`;
    const params: any[] = [];
    if (statusFilter && statusFilter !== "ALL") {
      query += ` WHERE t."status" = $1`;
      params.push(statusFilter);
    }
    query += ` ORDER BY t."created_at" DESC LIMIT 150`;

    const rows = await prisma.$queryRawUnsafe<any[]>(query, ...params);

    return ssrOptimize(
      rows.map((r) => ({
        ...r,
        messagesCount: Number(r.messagesCount || 0),
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
  return await addTicketMessage(ticketId, replyText);
}
