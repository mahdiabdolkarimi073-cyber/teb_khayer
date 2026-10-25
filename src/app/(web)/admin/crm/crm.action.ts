"use server";

import prisma from "@backend/modules/prisma/Prisma";
import { OrderStatus } from "@prisma/client";

export interface CustomerSegmentItem {
  id: string;
  name: string;
  phone: string;
  nationalCode: string | null;
  date: string;
  orderCount: number;
  successfulOrderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  segments: ("new" | "loyal" | "frequent" | "inactive" | "at_risk")[];
  latestOrderStatus?: string | null;
}

export interface CRMStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  loyalCustomersCount: number;
  frequentCustomersCount: number;
  inactiveCustomersCount: number;
  atRiskCustomersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
}

export async function getCRMStats(): Promise<CRMStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalCustomers,
    newCustomersThisMonth,
    allOrders,
    pendingOrdersCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        date: { gte: startOfMonth },
      },
    }),
    prisma.order.findMany({
      select: {
        id: true,
        userId: true,
        status: true,
        created_at: true,
        payment: {
          select: {
            amount: true,
          },
        },
      },
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    }),
  ]);

  // Aggregate user order stats
  const userStats = new Map<
    string,
    {
      orderCount: number;
      successfulCount: number;
      totalSpent: number;
      lastOrderDate: Date;
      recentOrderCount: number;
    }
  >();

  let totalRevenue = 0;
  let successfulOrdersTotal = 0;

  for (const o of allOrders) {
    const isSuccess = o.status === OrderStatus.DELAY || o.status === OrderStatus.SENDED || (o.payment?.amount && o.payment.amount > 0 && o.status !== OrderStatus.CANCELED);
    const amount = Number(o.payment?.amount || 0);

    if (isSuccess && amount > 0) {
      totalRevenue += amount;
      successfulOrdersTotal += 1;
    }

    const current = userStats.get(o.userId) || {
      orderCount: 0,
      successfulCount: 0,
      totalSpent: 0,
      lastOrderDate: new Date(0),
      recentOrderCount: 0,
    };

    current.orderCount += 1;
    if (isSuccess) {
      current.successfulCount += 1;
      current.totalSpent += amount;
    }

    const orderTime = new Date(o.created_at);
    if (orderTime > current.lastOrderDate) {
      current.lastOrderDate = orderTime;
    }

    if (orderTime >= sixtyDaysAgo) {
      current.recentOrderCount += 1;
    }

    userStats.set(o.userId, current);
  }

  let loyalCustomersCount = 0;
  let frequentCustomersCount = 0;
  let inactiveCustomersCount = 0;
  let atRiskCustomersCount = 0;

  userStats.forEach((stats) => {
    const isLoyal = stats.successfulCount >= 3 || stats.totalSpent >= 1000000;
    if (isLoyal) loyalCustomersCount++;

    const isFrequent = stats.recentOrderCount >= 2;
    if (isFrequent) frequentCustomersCount++;

    const isInactive = stats.lastOrderDate.getTime() < thirtyDaysAgo.getTime();
    if (isInactive) inactiveCustomersCount++;

    const isAtRisk = stats.successfulCount >= 1 && stats.lastOrderDate.getTime() < sixtyDaysAgo.getTime();
    if (isAtRisk) atRiskCustomersCount++;
  });

  const averageOrderValue = successfulOrdersTotal > 0 ? Math.round(totalRevenue / successfulOrdersTotal) : 0;

  return {
    totalCustomers,
    newCustomersThisMonth,
    loyalCustomersCount,
    frequentCustomersCount,
    inactiveCustomersCount,
    atRiskCustomersCount,
    totalRevenue,
    averageOrderValue,
    totalOrdersCount: allOrders.length,
    pendingOrdersCount,
  };
}

export async function getCRMCustomers(params: {
  segment?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { segment = "all", search = "", page = 1, limit = 50 } = params;

  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  // Search filter
  const cleanSearch = search.trim();
  let searchCondition: any = undefined;
  if (cleanSearch) {
    const searchNumber = Number(cleanSearch.replace(/^0+/, ""));
    const isNumeric = !isNaN(searchNumber) && cleanSearch.length >= 4;

    searchCondition = {
      OR: [
        { name: { contains: cleanSearch, mode: "insensitive" } },
        { nationalCode: { contains: cleanSearch } },
        ...(isNumeric ? [{ phone: searchNumber }] : []),
        { id: { contains: cleanSearch } },
      ],
    };
  }

  const users = await prisma.user.findMany({
    where: searchCondition,
    include: {
      orders: {
        select: {
          id: true,
          status: true,
          created_at: true,
          payment: {
            select: {
              amount: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 300,
  });

  const formatted: CustomerSegmentItem[] = [];

  for (const user of users) {
    let totalSpent = 0;
    let successfulCount = 0;
    let lastOrderDate: Date | null = null;
    let recentOrderCount = 0;

    for (const ord of user.orders) {
      const isSuccess =
        ord.status === OrderStatus.DELAY ||
        ord.status === OrderStatus.SENDED ||
        (ord.payment?.amount && ord.payment.amount > 0 && ord.status !== OrderStatus.CANCELED);
      const amount = Number(ord.payment?.amount || 0);

      if (isSuccess && amount > 0) {
        totalSpent += amount;
        successfulCount += 1;
      }

      const ordDate = new Date(ord.created_at);
      if (!lastOrderDate || ordDate > lastOrderDate) {
        lastOrderDate = ordDate;
      }

      if (ordDate >= sixtyDaysAgo) {
        recentOrderCount += 1;
      }
    }

    const segments: ("new" | "loyal" | "frequent" | "inactive" | "at_risk")[] = [];

    const isNew = user.orders.length <= 1 && new Date(user.date) >= thirtyDaysAgo;
    if (isNew) segments.push("new");

    const isLoyal = successfulCount >= 3 || totalSpent >= 1000000;
    if (isLoyal) segments.push("loyal");

    const isFrequent = recentOrderCount >= 2;
    if (isFrequent) segments.push("frequent");

    const isInactive = !lastOrderDate || lastOrderDate < thirtyDaysAgo;
    if (isInactive) segments.push("inactive");

    const isAtRisk = successfulCount >= 1 && lastOrderDate && lastOrderDate < sixtyDaysAgo;
    if (isAtRisk) segments.push("at_risk");

    // Match segment filter
    if (segment !== "all") {
      if (!segments.includes(segment as any)) {
        continue;
      }
    }

    formatted.push({
      id: user.id,
      name: user.name || "کاربر بی‌نام",
      phone: user.phone ? `0${user.phone}` : "-",
      nationalCode: user.nationalCode || null,
      date: user.date.toISOString(),
      orderCount: user.orders.length,
      successfulOrderCount: successfulCount,
      totalSpent,
      lastOrderDate: lastOrderDate ? lastOrderDate.toISOString() : null,
      segments,
      latestOrderStatus: user.orders[0]?.status || null,
    });
  }

  const offset = (page - 1) * limit;
  const paginated = formatted.slice(offset, offset + limit);

  return {
    items: paginated,
    totalCount: formatted.length,
    page,
    totalPages: Math.ceil(formatted.length / limit),
  };
}

export async function getCustomerDossier(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        orderBy: { created_at: "desc" },
      },
      courses: {
        include: {
          course: {
            select: { id: true, name: true, price: true },
          },
        },
      },
      orders: {
        include: {
          payment: true,
          products: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!user) return null;

  let totalSuccessfulSpent = 0;
  let successfulOrders = 0;
  let canceledOrders = 0;
  let pendingOrders = 0;

  for (const o of user.orders) {
    const isSuccess =
      o.status === OrderStatus.DELAY ||
      o.status === OrderStatus.SENDED ||
      (o.payment?.amount && o.payment.amount > 0 && o.status !== OrderStatus.CANCELED);

    if (isSuccess) {
      totalSuccessfulSpent += Number(o.payment?.amount || 0);
      successfulOrders += 1;
    } else if (o.status === OrderStatus.CANCELED) {
      canceledOrders += 1;
    } else if (o.status === OrderStatus.PENDING) {
      pendingOrders += 1;
    }
  }

  // Fetch support tickets and last login for the customer
  let tickets: any[] = [];
  let lastLogin: any = null;
  try {
    const { getLastSuccessfulLogin } = await import("@/backend/modules/crm/loginTracker");
    lastLogin = await getLastSuccessfulLogin(userId);
    const ticketRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "SupportTicket" WHERE "userId" = $1 ORDER BY "created_at" DESC`,
      userId
    );
    tickets = (ticketRows || []).map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      type: t.type,
      status: t.status,
      priority: t.priority,
      message: t.message,
      adminReply: t.adminReply,
      created_at: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
    }));
  } catch (e) {
    console.warn("Could not fetch tickets/login in dossier:", e);
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone ? `0${user.phone}` : "-",
      nationalCode: user.nationalCode || null,
      gender: user.gender || null,
      birthDate: user.birthDate || null,
      email: user.email || null,
      avatar: user.avatar,
      date: user.date.toISOString(),
      role: user.role,
    },
    lastLogin,
    tickets,
    addresses: user.addresses.map((a) => ({
      id: a.id,
      title: a.title,
      name: a.name,
      phone: a.phone,
      state: a.state,
      city: a.city,
      address: a.address,
      zipcode: a.zipcode,
      isDefault: a.isDefault,
    })),
    courses: user.courses.map((c) => ({
      id: c.id,
      courseId: c.courseId,
      name: c.course?.name || "دوره آموزشی",
      price: c.course?.price || 0,
      enrolledAt: c.created_at.toISOString(),
    })),
    orders: user.orders.map((o) => {
      let rawInfo: any = {};
      try {
        rawInfo = typeof o.info === "string" ? JSON.parse(o.info as string) : (o.info || {});
      } catch {
        rawInfo = {};
      }
      return {
        id: o.id,
        status: o.status,
        created_at: o.created_at.toISOString(),
        info: rawInfo,
        trackingCode: rawInfo?.trackingCode || rawInfo?.postalCode || null,
        payment: o.payment
          ? {
              id: o.payment.id,
              amount: o.payment.amount,
              receipt: o.payment.receipt,
              type: o.payment.type,
            }
          : null,
        products: o.products.map((p) => ({
          id: p.id,
          productId: p.productId,
          count: p.count,
          productName: p.product?.name || "محصول",
          price: p.product?.price || 0,
          image: Array.isArray(p.product?.images) && p.product.images.length > 0 ? p.product.images[0] : "/empty.png",
        })),
      };
    }),
    metrics: {
      totalOrders: user.orders.length,
      successfulOrders,
      canceledOrders,
      pendingOrders,
      totalSuccessfulSpent,
    },
  };
}
