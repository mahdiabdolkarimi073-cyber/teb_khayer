"use server";

import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { ensureCRMTables } from "@/backend/modules/crm/crmDb";
import { ssrOptimize } from "@/utils/other";

async function ensureUserCartSyncTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserCartSync" (
        "userId" TEXT PRIMARY KEY,
        "cartData" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    console.warn("Could not ensure UserCartSync table directly:", err);
  }
}

export async function syncUserCartToServer(cartData: Record<string, any>) {
  try {
    await ensureCRMTables();
  } catch {
    // fallback continues below
  }

  const user = await getUserFromCookie();
  if (!user) return { success: false, reason: "unauthenticated" };

  const jsonStr = JSON.stringify(cartData || {});

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "UserCartSync" ("userId", "cartData", "updated_at")
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT ("userId") 
       DO UPDATE SET "cartData" = $2::jsonb, "updated_at" = now()`,
      user.id,
      jsonStr
    );

    return { success: true };
  } catch (err: any) {
    // If table was missing (Postgres error 42P01), auto-create and retry once
    if (err?.code === "42P01" || String(err?.message || "").includes("UserCartSync")) {
      try {
        await ensureUserCartSyncTable();
        await prisma.$executeRawUnsafe(
          `INSERT INTO "UserCartSync" ("userId", "cartData", "updated_at")
           VALUES ($1, $2::jsonb, now())
           ON CONFLICT ("userId") 
           DO UPDATE SET "cartData" = $2::jsonb, "updated_at" = now()`,
          user.id,
          jsonStr
        );
        return { success: true };
      } catch (retryErr) {
        console.warn("Retry syncUserCartToServer failed:", retryErr);
      }
    }
    console.warn("Could not sync cart to server:", err);
    return { success: false };
  }
}

export async function getUserSavedCartFromServer(): Promise<Record<string, any>> {
  try {
    await ensureCRMTables();
  } catch {
    // fallback continues below
  }

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
  } catch (err: any) {
    // If relation does not exist, ensure table and return empty without crashing
    if (err?.code === "42P01" || String(err?.message || "").includes("UserCartSync")) {
      await ensureUserCartSyncTable();
    } else {
      console.warn("Could not fetch saved cart from server:", err);
    }
    return {};
  }
}
