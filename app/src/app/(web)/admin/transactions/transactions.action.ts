"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {startOfDay, endOfDay} from "@/utils/format";

async function requireAdmin() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

export interface TransactionResult {
  data: any[];
  total: number;
  lastHourCount: number;
}

export async function getTransactions(
  page: number,
  limit: number,
  search?: string,
  status?: "all" | "successful" | "failed" | "pending",
  startDate?: string,
  endDate?: string,
  minAmount?: number,
  maxAmount?: number,
  category?: string,
): Promise<TransactionResult> {
  await requireAdmin();

  const skip = (page - 1) * limit;
  const where: any = {};

  if (startDate && endDate) {
    where.created_at = {gte: startOfDay(new Date(startDate)), lte: endOfDay(new Date(endDate))};
  }

  if (status === "successful") where.receipt = {not: null};
  else if (status === "failed") where.receipt = null;

  if (minAmount !== undefined || maxAmount !== undefined) {
    where.amount = {};
    if (minAmount !== undefined) where.amount.gte = minAmount;
    if (maxAmount !== undefined) where.amount.lte = maxAmount;
  }

  if (search) {
    const numericSearch = +search;
    if (!isNaN(numericSearch) && search.length >= 4) {
      where.user = {phone: numericSearch};
    } else {
      where.user = {name: {contains: search}};
    }
  }

  const total = await prisma.payment.count({where});

  const data = await prisma.payment.findMany({
    where,
    skip,
    take: limit,
    orderBy: {created_at: "desc"},
    include: {
      user: true,
      order: {include: {products: {include: {product: {include: {category: true}}}}}},
    },
  });

  const hourAgo = new Date();
  hourAgo.setHours(hourAgo.getHours() - 1);
  const lastHourCount = await prisma.payment.count({
    where: {created_at: {gte: hourAgo}},
  });

  return {
    data: JSON.parse(JSON.stringify(data)),
    total,
    lastHourCount,
  };
}

export async function getTransactionDetail(paymentId: string) {
  await requireAdmin();

  const payment = await prisma.payment.findUnique({
    where: {id: paymentId},
    include: {
      user: true,
      order: {include: {products: {include: {product: {include: {category: true}}}}}},
      actions: true,
      service: {include: {service: true}},
    },
  });

  return payment ? JSON.parse(JSON.stringify(payment)) : null;
}
