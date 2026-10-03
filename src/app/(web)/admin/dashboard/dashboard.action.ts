"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {daysAgo, startOfDay, endOfDay} from "@/utils/format";

async function requireAdmin() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

export interface DashboardStats {
  totalUsers: number;
  lastMonthUsers: number;
  usersGrowth: number;
  totalOrders: number;
  pendingOrders: number;
  sendedOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalSales: number;
  totalDeposited: number;
  successfulCount: number;
  successfulValue: number;
  failedCount: number;
  failedValue: number;
  todayRevenue: number;
  todayRevenueGrowth: number;
  salesGrowth: number;
  ordersGrowth: number;
  activeUsers30: number;
  salesTrend: {date: string; total: number}[];
  topCategories: {name: string; total: number}[];
  recentOrders: any[];
  recentTransactions: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const thirtyDaysAgo = daysAgo(30);
  const lastMonthStart = daysAgo(60);
  const lastMonthEnd = daysAgo(30);

  // Successful payment = has receipt AND order is not CANCELED
  const successfulPaymentWhere = {
    receipt: {not: null},
    order: {status: {not: "CANCELED"}},
  };

  // --- Users ---
  const totalUsers = await prisma.user.count();
  const lastMonthUsers = await prisma.user.count({
    where: {date: {gte: lastMonthStart, lt: lastMonthEnd}},
  });
  const previousMonthUsers = await prisma.user.count({
    where: {date: {gte: daysAgo(90), lt: lastMonthStart}},
  });
  const usersGrowth = previousMonthUsers > 0
    ? Math.round(((lastMonthUsers - previousMonthUsers) / previousMonthUsers) * 100)
    : 0;

  // --- Orders ---
  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({where: {status: "PENDING"}});
  const sendedOrders = await prisma.order.count({where: {status: "SENDED"}});
  const completedOrders = await prisma.order.count({where: {status: "DELAY"}});
  const canceledOrders = await prisma.order.count({where: {status: "CANCELED"}});

  // Orders growth: compare last 30 days vs previous 30 days
  const ordersLast30 = await prisma.order.count({
    where: {created_at: {gte: thirtyDaysAgo}},
  });
  const ordersPrev30 = await prisma.order.count({
    where: {created_at: {gte: daysAgo(60), lt: thirtyDaysAgo}},
  });
  const ordersGrowth = ordersPrev30 > 0
    ? Math.round(((ordersLast30 - ordersPrev30) / ordersPrev30) * 100)
    : 0;

  // --- Total Sales (only successful, non-canceled orders) ---
  const salesAgg = await prisma.payment.aggregate({
    where: successfulPaymentWhere,
    _sum: {amount: true},
  });
  const totalSales = salesAgg._sum.amount || 0;

  // Sales growth: compare last 30 days vs previous 30 days
  const salesLast30Agg = await prisma.payment.aggregate({
    where: {
      ...successfulPaymentWhere,
      created_at: {gte: thirtyDaysAgo},
    },
    _sum: {amount: true},
  });
  const salesPrev30Agg = await prisma.payment.aggregate({
    where: {
      ...successfulPaymentWhere,
      created_at: {gte: daysAgo(60), lt: thirtyDaysAgo},
    },
    _sum: {amount: true},
  });
  const salesLast30 = salesLast30Agg._sum.amount || 0;
  const salesPrev30 = salesPrev30Agg._sum.amount || 0;
  const salesGrowth = salesPrev30 > 0
    ? Math.round(((salesLast30 - salesPrev30) / salesPrev30) * 100)
    : 0;

  const depositedAgg = await prisma.payment.aggregate({
    where: successfulPaymentWhere,
    _sum: {amount: true},
  });
  const totalDeposited = depositedAgg._sum.amount || 0;

  // --- Successful vs Failed ---
  const successfulPayments = await prisma.payment.findMany({
    where: successfulPaymentWhere,
    select: {amount: true},
  });
  const successfulCount = successfulPayments.length;
  const successfulValue = successfulPayments.reduce((s, p) => s + p.amount, 0);

  const failedPayments = await prisma.payment.findMany({
    where: {receipt: null},
    select: {amount: true},
  });
  const failedCount = failedPayments.length;
  const failedValue = failedPayments.reduce((s, p) => s + p.amount, 0);

  // --- Today's Revenue (only successful, non-canceled) ---
  const todayRevenueAgg = await prisma.payment.aggregate({
    where: {
      ...successfulPaymentWhere,
      created_at: {gte: todayStart, lte: todayEnd},
    },
    _sum: {amount: true},
  });
  const todayRevenue = todayRevenueAgg._sum.amount || 0;

  // Today revenue growth: compare today vs yesterday
  const yesterdayStart = daysAgo(1);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);
  const yesterdayRevenueAgg = await prisma.payment.aggregate({
    where: {
      ...successfulPaymentWhere,
      created_at: {gte: yesterdayStart, lte: yesterdayEnd},
    },
    _sum: {amount: true},
  });
  const yesterdayRevenue = yesterdayRevenueAgg._sum.amount || 0;
  const todayRevenueGrowth = yesterdayRevenue > 0
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
    : 0;

  // --- Active users (30 days) ---
  const activeUsers30 = await prisma.user.count({
    where: {
      orders: {some: {created_at: {gte: thirtyDaysAgo}}},
    },
  });

  // --- Sales trend (last 30 days, only successful non-canceled) ---
  const salesTrendRaw = await prisma.payment.findMany({
    where: {
      ...successfulPaymentWhere,
      created_at: {gte: thirtyDaysAgo},
    },
    select: {amount: true, created_at: true},
  });
  const trendMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    trendMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const p of salesTrendRaw) {
    const key = p.created_at.toISOString().split("T")[0];
    if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) || 0) + p.amount);
  }
  const salesTrend = Array.from(trendMap.entries()).map(([date, total]) => ({
    date,
    total: Math.round(total),
  }));

  // --- Top categories (only from successful, non-canceled orders) ---
  const ordersWithProducts = await prisma.orderProduct.findMany({
    where: {
      order: {
        status: {not: "CANCELED"},
        payment: {receipt: {not: null}},
      },
    },
    include: {product: {include: {category: true}}},
  });
  const catMap = new Map<string, number>();
  for (const op of ordersWithProducts) {
    const catName = op.product.category?.name || "نامشخص";
    catMap.set(catName, (catMap.get(catName) || 0) + op.count * op.product.price);
  }
  const topCategories = Array.from(catMap.entries())
    .map(([name, total]) => ({name, total: Math.round(total)}))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // --- Recent orders ---
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: {created_at: "desc"},
    include: {user: true, payment: true, products: {include: {product: true}}},
  });

  // --- Recent successful transactions (last 20) ---
  const recentTransactions = await prisma.payment.findMany({
    where: successfulPaymentWhere,
    take: 20,
    orderBy: {created_at: "desc"},
    include: {user: true, order: {include: {products: {include: {product: true}}}}},
  });

  return {
    totalUsers,
    lastMonthUsers,
    usersGrowth,
    totalOrders,
    pendingOrders,
    sendedOrders,
    completedOrders,
    canceledOrders,
    totalSales,
    totalDeposited,
    successfulCount,
    successfulValue,
    failedCount,
    failedValue,
    todayRevenue,
    todayRevenueGrowth,
    salesGrowth,
    ordersGrowth,
    activeUsers30,
    salesTrend,
    topCategories,
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    recentTransactions: JSON.parse(JSON.stringify(recentTransactions)),
  };
}

export async function getRecentSuccessfulTransactions(limit: number = 20) {
  await requireAdmin();

  const transactions = await prisma.payment.findMany({
    where: {
      receipt: {not: null},
      order: {status: {not: "CANCELED"}},
    },
    take: limit,
    orderBy: {created_at: "desc"},
    include: {
      user: true,
      order: {include: {products: {include: {product: {include: {category: true}}}}}},
    },
  });

  return JSON.parse(JSON.stringify(transactions));
}
