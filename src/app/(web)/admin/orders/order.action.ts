'use server';

import prisma from "@backend/modules/prisma/Prisma";
import { ssrOptimize } from "@/utils/other";
import { Order, OrderStatus } from "@prisma/client";
import { ensureCRMTables } from "@/backend/modules/crm/crmDb";
import { getVar, setVar } from "@backend/utils/setting";

export const CANCELLATION_REASONS = [
  "تغییر نظر مشتری",
  "تأخیر در ارسال",
  "ناموجودشدن کالا",
  "مشکل پرداخت",
  "ثبت اشتباه سفارش",
  "سایر موارد",
] as const;

export type CancellationReasonType = (typeof CANCELLATION_REASONS)[number];

export async function getAllOrders(skip = 0, status: OrderStatus | undefined, phone: number | undefined) {
  await ensureCRMTables();
  return ssrOptimize(
    await prisma.order.findMany({
      where: {
        ...(status && { status }),
        ...(phone && {
          user: {
            phone,
          },
        }),
      },
      skip,
      take: 10,
      include: {
        payment: true,
        products: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        created_at: "desc",
      },
    })
  );
}

export async function changeOrderStatus(orderId: Order['id'], status: OrderStatus) {
  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
  });
}

/**
 * Cancels an order with a mandatory categorized reason and optional note.
 * Records the event in OrderCancellation, order.info, CustomerActivityLog, and UserNotification.
 */
export async function cancelOrderWithReason(
  orderId: number,
  reason: string,
  note?: string,
  canceledBy = "مدیریت"
) {
  await ensureCRMTables();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    return { success: false, message: "سفارش مورد نظر یافت نشد." };
  }

  let info: any = {};
  try {
    info = typeof order.info === "string" ? JSON.parse(order.info as string) : (order.info || {});
  } catch {
    info = {};
  }

  info.cancellationReason = reason.trim();
  info.cancellationNote = note ? note.trim() : null;
  info.canceledAt = new Date().toISOString();
  info.canceledBy = canceledBy;

  // 1. Update order status and info
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELED,
      info,
    },
  });

  // 2. Insert or update OrderCancellation table
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "OrderCancellation" ("orderId", "userId", "reason", "note", "canceledBy", "created_at")
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT ("orderId") 
       DO UPDATE SET "reason" = $3, "note" = $4, "canceledBy" = $5, "created_at" = now()`,
      orderId,
      order.userId,
      reason.trim(),
      note ? note.trim() : null,
      canceledBy
    );

    // 3. Activity log
    await prisma.$executeRawUnsafe(
      `INSERT INTO "CustomerActivityLog" ("userId", "action", "details", "actor", "created_at")
       VALUES ($1, 'لغو سفارش', $2, $3, now())`,
      order.userId,
      `سفارش #${orderId} لغو شد. علت: ${reason}${note ? ` (توضیح: ${note})` : ""}`,
      canceledBy
    );

    // 4. Notify customer
    await prisma.$executeRawUnsafe(
      `INSERT INTO "UserNotification" ("userId", "title", "message", "link", "created_at")
       VALUES ($1, $2, $3, $4, now())`,
      order.userId,
      `سفارش #${orderId} لغو گردید`,
      `سفارش شما به علت «${reason}» لغو شد.${note ? ` توضیح: ${note}` : ""}`,
      `/dashboard/orders`
    );
  } catch (err) {
    console.error("Error logging cancellation record:", err);
  }

  return { success: true, message: `سفارش #${orderId} با موفقیت لغو و علت «${reason}» ثبت گردید.` };
}

export async function getOrderCancellation(orderId: number) {
  await ensureCRMTables();
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "OrderCancellation" WHERE "orderId" = $1 LIMIT 1`,
      orderId
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      orderId: r.orderId,
      userId: r.userId,
      reason: r.reason,
      note: r.note,
      canceledBy: r.canceledBy,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    };
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export async function getCancellationReports() {
  await ensureCRMTables();
  try {
    const reasonCounts = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "reason", count(*) as count 
       FROM "OrderCancellation" 
       GROUP BY "reason" 
       ORDER BY count DESC`
    );

    const recentCancellations = await prisma.$queryRawUnsafe<any[]>(
      `SELECT c.*, u.name as "userName", u.phone as "userPhone"
       FROM "OrderCancellation" c
       LEFT JOIN "User" u ON u.id = c."userId"
       ORDER BY c."created_at" DESC
       LIMIT 50`
    );

    return {
      byReason: reasonCounts.map((rc) => ({
        reason: rc.reason,
        count: Number(rc.count || 0),
      })),
      recent: recentCancellations.map((rc) => ({
        ...rc,
        created_at: rc.created_at ? new Date(rc.created_at).toISOString() : new Date().toISOString(),
      })),
    };
  } catch (e) {
    console.error("Error fetching cancellation reports:", e);
    return { byReason: [], recent: [] };
  }
}

export async function getOrdersCount(status: OrderStatus | undefined, phone: number | undefined) {
  return await prisma.order.count(
    status
      ? {
          where: {
            ...(status && {
              status,
            }),
            ...(phone && {
              user: {
                phone,
              },
            }),
          },
        }
      : {}
  );
}

export async function updateOrderTrackingCode(orderId: number, trackingCode: string, shippingCompany = "پست پیشتاز") {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, message: "سفارش یافت نشد" };

  let info: any = {};
  try {
    info = typeof order.info === "string" ? JSON.parse(order.info as string) : (order.info || {});
  } catch {
    info = {};
  }

  info.trackingCode = trackingCode.trim();
  info.shippingCompany = shippingCompany.trim();
  info.shippedAt = new Date().toISOString();

  await prisma.order.update({
    where: { id: orderId },
    data: {
      info,
      status: OrderStatus.SENDED,
    },
  });

  return { success: true, message: "کد رهگیری با موفقیت ثبت و وضعیت سفارش به «ارسال شده» تغییر یافت." };
}

export type SenderInfoType = {
  name: string;
  phone: string;
  address: string;
  zipcode: string;
};

export async function getSenderSettings(): Promise<SenderInfoType> {
  const name = (await getVar<string>("SENDER_NAME")) || "فروشگاه آنلاین طِب خیّر";
  const phone = (await getVar<string>("SENDER_PHONE")) || (await getVar<string>("MAIN_PHONE")) || "045-33790667";
  const address = (await getVar<string>("SENDER_ADDRESS")) || (await getVar<string>("TRUST_ADDRESS")) || "اردبیل، میدان شریعتی، مجتمع خیّر، طبقه ۲، فروشگاه طِب خیّر";
  const zipcode = (await getVar<string>("SENDER_ZIPCODE")) || "5613612345";

  return { name, phone, address, zipcode };
}

export async function updateSenderSettings(data: SenderInfoType) {
  if (data.name) await setVar("SENDER_NAME", data.name.trim());
  if (data.phone) await setVar("SENDER_PHONE", data.phone.trim());
  if (data.address) await setVar("SENDER_ADDRESS", data.address.trim());
  if (data.zipcode) await setVar("SENDER_ZIPCODE", data.zipcode.trim());
  return { success: true, message: "اطلاعات فرستنده با موفقیت ذخیره شد." };
}

export async function getOrderLabelData(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      payment: true,
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) return null;

  const sender = await getSenderSettings();

  let rawInfo: any = {};
  try {
    rawInfo = typeof order.info === "string" ? JSON.parse(order.info as string) : (order.info || {});
  } catch {
    rawInfo = {};
  }

  const recipient = {
    name: rawInfo?.name || order.user?.name || "گیرنده محترم",
    phone: rawInfo?.phone || (order.user?.phone ? `0${order.user.phone}` : "-"),
    state: rawInfo?.state || "",
    city: rawInfo?.city || "",
    address: rawInfo?.address || order.user?.address || "آدرس ثبت نشده",
    zipcode: rawInfo?.zipcode || rawInfo?.postalCode || order.user?.zipcode || "-",
  };

  const formattedAddress = [recipient.state, recipient.city, recipient.address].filter(Boolean).join("، ");

  return ssrOptimize({
    order: {
      id: order.id,
      createdAt: order.created_at,
      status: order.status,
      paymentAmount: Number(order.payment?.amount || 0),
      shippingFee: Number(rawInfo?.shippingFee ?? (rawInfo?.isFreeShipping ? 0 : 36000)),
      isFreeShipping: Boolean(rawInfo?.isFreeShipping),
      trackingCode: rawInfo?.trackingCode || null,
      shippingCompany: rawInfo?.shippingCompany || "پست پیشتاز",
      items: order.products.map((op) => ({
        id: op.product.id,
        name: op.product.name,
        count: op.count,
        price: Number(op.product.price),
      })),
      itemCount: order.products.reduce((acc, p) => acc + p.count, 0),
    },
    recipient: {
      ...recipient,
      fullAddress: formattedAddress,
    },
    sender,
  });
}

