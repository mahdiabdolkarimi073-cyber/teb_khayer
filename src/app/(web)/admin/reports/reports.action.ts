"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {startOfDay, endOfDay} from "@/utils/format";

async function requireAdmin() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
}

export interface ReportData {
  newUsers: number;
  activeUsers: number;
  totalSales: number;
  costOfGoods: number;
  netProfit: number;
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
  salesByProduct: {name: string; quantity: number; sales: number; cost: number; profit: number}[];
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
  const markup = Number(await prisma.setting.findUnique({where: {key: "PRODUCT_MARKUP_PERCENT"}}).then((setting) => setting?.value || "0"));
  const markupFactor = 1 + (Number.isFinite(markup) ? markup : 0) / 100;

  const newUsers = await prisma.user.count({where: {date: {...where.created_at}}});
  const activeUsers = await prisma.user.count({where: {orders: {some: {created_at: {...where.created_at}}}}});
  const deliveredOrders = await prisma.order.findMany({
    where: {created_at: {...where.created_at}, status: {in: ["SENDED", "DELAY"]}},
    include: {payment: true, products: {include: {product: {include: {category: true}}}}},
    orderBy: {created_at: "asc"},
  });

  const totalSales = deliveredOrders.reduce((sum, order) => sum + order.payment.amount, 0);
  const orderCount = deliveredOrders.length;
  const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
  const productMap = new Map<string, {name: string; quantity: number; sales: number; cost: number; profit: number}>();
  const categoryMap = new Map<string, number>();

  for (const order of deliveredOrders) {
    for (const orderProduct of order.products) {
      const product = orderProduct.product;
      const quantity = orderProduct.count;
      const sales = quantity * product.price;
      const cost = quantity * (product.price / markupFactor);
      const current = productMap.get(product.id) || {name: product.name, quantity: 0, sales: 0, cost: 0, profit: 0};
      current.quantity += quantity;
      current.sales += sales;
      current.cost += cost;
      current.profit += sales - cost;
      productMap.set(product.id, current);
      const categoryName = product.category?.name || "نامشخص";
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + sales);
    }
  }

  const paymentsInPeriod = await prisma.payment.findMany({where: {...where, receipt: {not: null}}});
  const failedPayments = await prisma.payment.findMany({where: {...where, receipt: null}});
  const successfulCount = paymentsInPeriod.length;
  const successfulValue = paymentsInPeriod.reduce((sum, payment) => sum + payment.amount, 0);
  const failedCount = failedPayments.length;
  const failedValue = failedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const successRate = successfulCount + failedCount > 0 ? Math.round((successfulCount / (successfulCount + failedCount)) * 100) : 0;
  const costOfGoods = Array.from(productMap.values()).reduce((sum, product) => sum + product.cost, 0);
  const netProfit = totalSales - costOfGoods;

  const usersRaw = await prisma.user.findMany({where: {date: {...where.created_at}}, select: {date: true}});
  const userMap = new Map<string, number>();
  for (const user of usersRaw) {
    const key = user.date.toISOString().split("T")[0];
    userMap.set(key, (userMap.get(key) || 0) + 1);
  }

  const trendMap = new Map<string, number>();
  for (const order of deliveredOrders) {
    const key = order.created_at.toISOString().split("T")[0];
    trendMap.set(key, (trendMap.get(key) || 0) + order.payment.amount);
  }

  return {
    newUsers,
    activeUsers,
    totalSales: Math.round(totalSales),
    costOfGoods: Math.round(costOfGoods),
    netProfit: Math.round(netProfit),
    orderCount,
    avgOrderValue: Math.round(avgOrderValue),
    totalDeposited: Math.round(totalSales),
    successfulCount,
    successfulValue: Math.round(successfulValue),
    failedCount,
    failedValue: Math.round(failedValue),
    successRate,
    netRevenue: Math.round(netProfit),
    salesByCategory: Array.from(categoryMap.entries()).map(([name, total]) => ({name, total: Math.round(total)})).sort((a, b) => b.total - a.total),
    salesByProduct: Array.from(productMap.values()).map((product) => ({...product, sales: Math.round(product.sales), cost: Math.round(product.cost), profit: Math.round(product.profit)})).sort((a, b) => b.sales - a.sales),
    userGrowth: Array.from(userMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({date, count})),
    salesTrend: Array.from(trendMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, total]) => ({date, total: Math.round(total)})),
  };
}
