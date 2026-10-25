import prisma from "@backend/modules/prisma/Prisma";

let initialized = false;

/**
 * Initializes CRM database tables if they do not exist:
 * 1. SupportTicket (پشتیبانی، تیکت‌ها، شکایات و سؤالات)
 * 2. UserLoginLog (تاریخچه آخرین ورودهای موفق)
 * 3. UserCartSync (حفظ سبد خرید در سرور برای مراجعه بعدی)
 */
export async function ensureCRMTables() {
  if (initialized) return;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SupportTicket" (
        "id" SERIAL PRIMARY KEY,
        "ticketNumber" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "userName" TEXT,
        "userPhone" TEXT,
        "orderId" INTEGER,
        "type" TEXT NOT NULL DEFAULT 'QUESTION',
        "subject" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "priority" TEXT NOT NULL DEFAULT 'NORMAL',
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "adminReply" TEXT,
        "adminRepliedAt" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SupportTicket_userId_idx" ON "SupportTicket" ("userId");
      CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket" ("status");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserLoginLog" (
        "id" SERIAL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "phone" TEXT,
        "ip" TEXT,
        "userAgent" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "UserLoginLog_userId_idx" ON "UserLoginLog" ("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserCartSync" (
        "userId" TEXT PRIMARY KEY,
        "cartData" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    initialized = true;
  } catch (error) {
    console.warn("CRM tables init warning (may already exist or using schema):", error);
    initialized = true;
  }
}
