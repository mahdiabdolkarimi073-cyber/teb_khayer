"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {startOfDay, endOfDay} from "@/utils/format";

async function requireAdmin() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

export interface ReportData {
  newUsers: number;
  activeUsers: number;
  totalSales: number;
  orderCount: number;
  avgOrderValue: number;
  totalDeposited: number;
  successfulCount: number;
  successfulValue: number;
  failedCount: number;
  failedValue: number;
  successRate: number;
  netRevenue: number;
  salesByCategory: {name: string; total: number}[];
  userGrowth: {date: string; count: number}[];
  salesTrend: {date: string; total: number}[];
}

export async function getReportData(
  startDate: string,
  endDate: string,
  groupBy: "day" | "week" | "month" = "day",
  category?: string,
  status?: string,
): Promise<ReportData> {
  await requireAdmin();

  const start = startOfDay(new Date(startDate));
  const end = endOfDay(new Date(endDate));
  const where = {created_at: {gte: start, lte: end}};

  const newUsers = await prisma.user.count({where: {date: {...where.created_at}}});

  const activeUsers = await prisma.user.count({
    where: {orders: {some: {created_at: {gte: start, lte: end}}}},
  });

  const paymentsInPeriod = await prisma.payment.findMany({
    where: {...where, receipt: {not: null}},
    include: {order: {include: {products: {include: {product: {include: {category: true}}}}}}},
  });

  const totalSales = paymentsInPeriod.reduce((s, p) => s + p.amount, 0);
  const orderCount = await prisma.order.count({where: {...where}});
  const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

  const totalDeposited = totalSales;

  const successfulCount = paymentsInPeriod.length;
  const successfulValue = totalSales;

  const failedPayments = await prisma.payment.findMany({
    where: {...where, receipt: null},
  });
  const failedCount = failedPayments.length;
  const failedValue = failedPayments.reduce((s, p) => s + p.amount, 0);

  const successRate = successfulCount + failedCount > 0
    ? Math.round((successfulCount / (successfulCount + failedCount)) * 100)
    : 0;

  const netRevenue = totalSales;

  // Sales by category
  const catMap = new Map<string, number>();
  for (const p of paymentsInPeriod) {
    if (p.order?.products) {
      for (const op of p.order.products) {
        const catName = op.product.category?.name || "نامشخص";
        catMap.set(catName, (catMap.get(catName) || 0) + op.count * op.product.price);
      }
    }
  }
  const salesByCategory = Array.from(catMap.entries())
    .map(([name, total]) => ({name, total: Math.round(total)}))
    .sort((a, b) => b.total - a.total);

  // User growth
  const usersRaw = await prisma.user.findMany({
    where: {date: {gte: start, lte: end}},
    select: {date: true},
  });
  const userMap = new Map<string, number>();
  for (const u of usersRaw) {
    const key = u.date.toISOString().split("T")[0];
    userMap.set(key, (userMap.get(key) || 0) + 1);
  }
  const userGrowth = Array.from(userMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({date, count}));

  // Sales trend
  const trendMap = new Map<string, number>();
  for (const p of paymentsInPeriod) {
    const key = p.created_at.toISOString().split("T")[0];
    trendMap.set(key, (trendMap.get(key) || 0) + p.amount);
  }
  const salesTrend = Array.from(trendMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total]) => ({date, total: Math.round(total)}));

  return {
    newUsers,
    activeUsers,
    totalSales: Math.round(totalSales),
    orderCount,
    avgOrderValue: Math.round(avgOrderValue),
    totalDeposited: Math.round(totalDeposited),
    successfulCount,
    successfulValue: Math.round(successfulValue),
    failedCount,
    failedValue: Math.round(failedValue),
    successRate,
    netRevenue: Math.round(netRevenue),
    salesByCategory,
    userGrowth,
    salesTrend,
  };
}
