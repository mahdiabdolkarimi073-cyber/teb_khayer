"use server";

import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { ensureCRMTables } from "@/backend/modules/crm/crmDb";
import { ssrOptimize } from "@/utils/other";

export async function syncUserCartToServer(cartData: Record<string, any>) {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user) return { success: false, reason: "unauthenticated" };

  try {
    const jsonStr = JSON.stringify(cartData || {});
    await prisma.$executeRawUnsafe(
      `INSERT INTO "UserCartSync" ("userId", "cartData", "updated_at")
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT ("userId") 
       DO UPDATE SET "cartData" = $2::jsonb, "updated_at" = now()`,
      user.id,
      jsonStr
    );

    return { success: true };
  } catch (err) {
    console.warn("Could not sync cart to server:", err);
    return { success: false };
  }
}

export async function getUserSavedCartFromServer(): Promise<Record<string, any>> {
  await ensureCRMTables();
  const user = await getUserFromCookie();
  if (!user) return {};

  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "cartData" FROM "UserCartSync" WHERE "userId" = $1`,
      user.id
    );

    if (!rows || rows.length === 0 || !rows[0].cartData) {
      return {};
    }

    const data = typeof rows[0].cartData === "string" ? JSON.parse(rows[0].cartData) : rows[0].cartData;
    return ssrOptimize(data || {});
  } catch (err) {
    console.warn("Could not fetch saved cart from server:", err);
    return {};
  }
}
