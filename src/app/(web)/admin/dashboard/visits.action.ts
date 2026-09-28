"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {daysAgo, startOfDay, endOfDay} from "@/utils/format";

async function requireAdmin() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

export interface VisitStats {
  totalVisits: number;
  todayVisits: number;
  visitsTrend: {date: string; total: number}[];
}

export async function getVisitStats(): Promise<VisitStats> {
  await requireAdmin();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const thirtyDaysAgo = daysAgo(30);

  const totalVisits = await prisma.siteVisit.count();
  const todayVisits = await prisma.siteVisit.count({
    where: {created_at: {gte: todayStart, lte: todayEnd}},
  });

  const trendRaw = await prisma.siteVisit.findMany({
    where: {created_at: {gte: thirtyDaysAgo}},
    select: {created_at: true},
  });

  const trendMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    trendMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const v of trendRaw) {
    const key = v.created_at.toISOString().split("T")[0];
    if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) || 0) + 1);
  }
  const visitsTrend = Array.from(trendMap.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  return {totalVisits, todayVisits, visitsTrend};
}

export async function recordVisit(path: string): Promise<void> {
  try {
    await prisma.siteVisit.create({data: {path}});
  } catch {
    // best-effort: don't break page render if visit recording fails
  }
}

export async function getPublicVisitCount(): Promise<number> {
  try {
    return await prisma.siteVisit.count();
  } catch {
    return 0;
  }
}
