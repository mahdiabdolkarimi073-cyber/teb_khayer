import prisma from "@backend/modules/prisma/Prisma";

let initialized = false;

/**
 * Initializes CRM database tables if they do not exist:
 * 1. SupportTicket (درخواست‌ها، تیکت‌ها و شکایات با شماره پیگیری یکتا)
 * 2. SupportMessage (مکاتبات تکمیلی و پیام‌های گفتگوی تیکت)
 * 3. SupportFAQ (پرسش‌های متداول با امکان مدیریت کامل)
 * 4. OrderCancellation (مدیریت علل و سوابق لغو سفارش‌ها)
 * 5. CustomerAdminNote (یادداشت‌های داخلی مدیریت روی مشتری)
 * 6. CustomerActivityLog (سوابق و آخرین تغییرات و اقدامات مشتری)
 * 7. UserNotification (اعلان‌های درون‌برنامه‌ای و پیامکی مشتری)
 * 8. UserLoginLog (تاریخچه آخرین ورودهای موفق)
 * 9. UserCartSync (حفظ سبد خرید در سرور برای مراجعه بعدی)
 */
export async function ensureCRMTables() {
  if (initialized) return;

  try {
    // 1. SupportTicket
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
      CREATE INDEX IF NOT EXISTS "SupportTicket_userId_idx" ON "SupportTicket" ("userId");
      CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket" ("status");
    `);

    // 2. SupportMessage (Conversation thread)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SupportMessage" (
        "id" SERIAL PRIMARY KEY,
        "ticketId" INTEGER NOT NULL,
        "senderRole" TEXT NOT NULL DEFAULT 'USER',
        "senderName" TEXT,
        "message" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "SupportMessage_ticketId_idx" ON "SupportMessage" ("ticketId");
    `);

    // 3. SupportFAQ (پرسش‌های متداول)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SupportFAQ" (
        "id" SERIAL PRIMARY KEY,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'عمومی',
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // Seed default FAQs if empty
    const faqCount = await prisma.$queryRawUnsafe<any[]>(`SELECT count(*) as cnt FROM "SupportFAQ"`);
    if (faqCount && Number(faqCount[0]?.cnt || 0) === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SupportFAQ" ("question", "answer", "category", "sortOrder") VALUES
        ('سفارشات چگونه و طی چه زمانی ارسال می‌شوند؟', 'کلیه سفارشات توسط شرکت ملی پست یا تیپاکس به صورت پیشتاز ارسال شده و ظرف ۲ الی ۴ روز کاری در سراسر کشور تحویل داده می‌شوند.', 'سفارش و ارسال', 1),
        ('چگونه می‌توانم کد رهگیری مرسوله پستی را دریافت و پیگیری کنم؟', 'پس از تحویل سفارش به اداره پست، کد رهگیری ۲۴ رقمی برای شماره همراه شما پیامک شده و همچنین در بخش «سفارشات من» و صفحه «پیگیری سفارش» در دسترس خواهد بود.', 'پیگیری سفارش', 2),
        ('شرایط لغو یا مرجوعی کالا چیست؟', 'در صورت انصراف تا قبل از ارسال می‌توانید با واحد پشتیبانی تماس بگیرید. پس از تحویل، در صورت هرگونه نقص کالا یا عدم تطابق تا ۷ روز امکان عودت وجود دارد.', 'پشتیبانی و مرجوعی', 3),
        ('آیا امکان پرداخت در محل وجود دارد؟', 'در حال حاضر به منظور تسریع در ارسال و بسته‌بندی، تمامی پرداخت‌ها از طریق درگاه امن شتابی به صورت آنلاین انجام می‌پذیرد.', 'پرداخت و فاکتور', 4)
      `);
    }

    // 4. OrderCancellation
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OrderCancellation" (
        "id" SERIAL PRIMARY KEY,
        "orderId" INTEGER NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "note" TEXT,
        "canceledBy" TEXT DEFAULT 'مدیریت',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "OrderCancellation_userId_idx" ON "OrderCancellation" ("userId");
    `);

    // 5. CustomerAdminNote (یادداشت‌های داخلی مدیریت)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CustomerAdminNote" (
        "id" SERIAL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "adminId" TEXT,
        "adminName" TEXT DEFAULT 'مدیر سیستم',
        "note" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "CustomerAdminNote_userId_idx" ON "CustomerAdminNote" ("userId");
    `);

    // 6. CustomerActivityLog (سوابق و آخرین اقدامات)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CustomerActivityLog" (
        "id" SERIAL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "details" TEXT,
        "actor" TEXT DEFAULT 'سیستم',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "CustomerActivityLog_userId_idx" ON "CustomerActivityLog" ("userId");
    `);

    // 7. UserNotification (سیستم اطلاع‌رسانی به مشتری)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserNotification" (
        "id" SERIAL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "link" TEXT,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "UserNotification_userId_idx" ON "UserNotification" ("userId");
    `);

    // 8. UserLoginLog
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserLoginLog" (
        "id" SERIAL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "phone" TEXT,
        "ip" TEXT,
        "userAgent" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "UserLoginLog_userId_idx" ON "UserLoginLog" ("userId");
    `);

    // 9. UserCartSync
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserCartSync" (
        "userId" TEXT PRIMARY KEY,
        "cartData" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    initialized = true;
  } catch (error) {
    console.warn("CRM tables init warning:", error);
    initialized = true;
  }
}
