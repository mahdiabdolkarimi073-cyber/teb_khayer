import prisma from "@backend/modules/prisma/Prisma";
import { ensureCRMTables } from "./crmDb";

export interface LoginLogEntry {
  id: number;
  userId: string;
  phone: string;
  ip: string;
  userAgent: string;
  created_at: string;
}

export async function recordUserLogin(userId: string, phone: number | string, ip = "127.0.0.1", userAgent = "وب‌سایت طِب خیّر") {
  try {
    await ensureCRMTables();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "UserLoginLog" ("userId", "phone", "ip", "userAgent", "created_at")
       VALUES ($1, $2, $3, $4, now())`,
      userId,
      String(phone),
      ip,
      userAgent
    );
  } catch (e) {
    console.warn("Could not log user login:", e);
  }
}

export async function getLastSuccessfulLogin(userId: string): Promise<LoginLogEntry | null> {
  try {
    await ensureCRMTables();
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "UserLoginLog" 
       WHERE "userId" = $1 
       ORDER BY "created_at" DESC 
       LIMIT 2`,
      userId
    );

    if (!rows || rows.length === 0) return null;

    // If there is more than 1, the second one is the "previous" login before current session.
    // Otherwise return the most recent one.
    const target = rows.length > 1 ? rows[1] : rows[0];

    return {
      id: target.id,
      userId: target.userId,
      phone: target.phone,
      ip: target.ip || "ثبت‌شده",
      userAgent: target.userAgent || "مرورگر وب",
      created_at: target.created_at ? new Date(target.created_at).toISOString() : new Date().toISOString(),
    };
  } catch (e) {
    console.warn("Could not fetch last login:", e);
    return null;
  }
}
