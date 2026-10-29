import prisma from "@backend/modules/prisma/Prisma";
import { getVar } from "@backend/utils/setting";
import { ensureCRMTables } from "@/backend/modules/crm/crmDb";

export type SmsSendResult = {
  success: boolean;
  messageId?: string;
  reason?: string;
  status: "SENT" | "FAILED" | "DISABLED_OR_NOT_CONFIGURED";
  logId?: number;
};

export type SmsSendOptions = {
  to: string;
  message: string;
  provider?: string;
  templateId?: number;
};

export class SmsService {
  /**
   * Retrieves the current SMS configuration from settings and env vars.
   */
  static async getConfig() {
    const isEnabled = (await getVar<string>("SMS_ENABLED", process.env.SMS_ENABLED || "false")) === "true";
    const provider = (await getVar<string>("SMS_PROVIDER", process.env.SMS_PROVIDER || "sms.ir")) || "sms.ir";
    const apiKey = (await getVar<string>("SMS_API_KEY", process.env.SMS_API_KEY || "")) || "";
    const lineNumber = (await getVar<string>("SMS_LINE_NUMBER", process.env.SMS_LINE_NUMBER || "")) || "";
    const delayMinutes = Number((await getVar<string>("SMS_REMINDER_DELAY_MINUTES", "10")) || 10);
    const template =
      (await getVar<string>(
        "SMS_ABANDONED_TEMPLATE",
        "{name} عزیز، خرید شما در طِب خیّر ناتمام ماند! جهت تکمیل سفارش خود روی لینک زیر کلیک کنید:\n{link}\nکد سفارش: {orderId}"
      )) || "{name} عزیز، خرید شما در طِب خیّر ناتمام ماند! جهت تکمیل سفارش خود روی لینک زیر کلیک کنید:\n{link}\nکد سفارش: {orderId}";

    const isReady = Boolean(isEnabled && apiKey.trim());

    return {
      isEnabled,
      isReady,
      provider,
      apiKey,
      lineNumber,
      delayMinutes,
      template,
    };
  }

  /**
   * Sends an SMS message through the configured provider, or logs it as simulated/disabled.
   * Never throws; handles provider errors gracefully.
   */
  static async sendSms(options: SmsSendOptions): Promise<SmsSendResult> {
    await ensureCRMTables();
    const config = await this.getConfig();
    const cleanPhone = String(options.to).replace(/[^0-9]/g, "");

    // If SMS sending is disabled or API key is not configured, record in log and return safely
    if (!config.isReady) {
      try {
        const log = await prisma.$queryRawUnsafe<any[]>(
          `INSERT INTO "SmsLog" ("phone", "message", "status", "provider", "response", "created_at")
           VALUES ($1, $2, $3, $4, $5, now()) RETURNING "id"`,
          cleanPhone,
          options.message,
          "DISABLED_OR_NOT_CONFIGURED",
          config.provider,
          JSON.stringify({
            notice: "ارسال واقعی پیامک غیرفعال است (نیاز به تنظیم API Key در پنل مدیریت)",
            timestamp: new Date().toISOString(),
          })
        );
        return {
          success: false,
          status: "DISABLED_OR_NOT_CONFIGURED",
          reason: "پنل پیامک فعال نشده یا کلید API وارد نشده است.",
          logId: log?.[0]?.id,
        };
      } catch (e: any) {
        console.warn("SMS log write failed:", e);
        return {
          success: false,
          status: "DISABLED_OR_NOT_CONFIGURED",
          reason: "پنل پیامک غیرفعال است.",
        };
      }
    }

    // Provider Integration Adapter
    try {
      let providerResponse: any = null;

      if (config.provider.toLowerCase().includes("kavenegar")) {
        // Kavenegar API Adapter
        const url = `https://api.kavenegar.com/v1/${config.apiKey}/sms/send.json`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            receptor: cleanPhone,
            message: options.message,
            ...(config.lineNumber ? { sender: config.lineNumber } : {}),
          }),
        });
        providerResponse = await res.json();
      } else if (config.provider.toLowerCase().includes("faraz") || config.provider.toLowerCase().includes("ippanel")) {
        // FarazSMS / IPPanel API Adapter
        const url = "https://api2.ippanel.com/api/v1/sms/send/webservice/single";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": config.apiKey,
          },
          body: JSON.stringify({
            recipient: [cleanPhone],
            sender: config.lineNumber,
            message: options.message,
          }),
        });
        providerResponse = await res.json();
      } else {
        // Default: sms.ir API Adapter
        const url = "https://api.sms.ir/v1/send/bulk";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": config.apiKey,
          },
          body: JSON.stringify({
            lineNumber: config.lineNumber || undefined,
            MessageText: options.message,
            Mobiles: [cleanPhone],
          }),
        });
        providerResponse = await res.json();
      }

      await prisma.$executeRawUnsafe(
        `INSERT INTO "SmsLog" ("phone", "message", "status", "provider", "response", "created_at")
         VALUES ($1, $2, $3, $4, $5, now())`,
        cleanPhone,
        options.message,
        "SENT",
        config.provider,
        JSON.stringify(providerResponse)
      );

      return {
        success: true,
        status: "SENT",
        messageId: String(providerResponse?.messageId || providerResponse?.data?.messageId || Date.now()),
      };
    } catch (err: any) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "SmsLog" ("phone", "message", "status", "provider", "response", "created_at")
         VALUES ($1, $2, $3, $4, $5, now())`,
        cleanPhone,
        options.message,
        "FAILED",
        config.provider,
        JSON.stringify({ error: err?.message || String(err) })
      );

      return {
        success: false,
        status: "FAILED",
        reason: err?.message || "خطا در برقراری ارتباط با وب‌سرویس پیامک",
      };
    }
  }

  /**
   * Renders template text with dynamic placeholders: {name}, {orderId}, {link}, {amount}
   */
  static renderTemplate(
    template: string,
    vars: { name?: string; orderId?: number | string; link?: string; amount?: number | string }
  ): string {
    let text = template;
    text = text.replace(/{name}/g, vars.name || "مشتری گرامی");
    text = text.replace(/{orderId}/g, String(vars.orderId || ""));
    text = text.replace(/{link}/g, vars.link || "");
    text = text.replace(/{amount}/g, vars.amount ? `${Number(vars.amount).toLocaleString("fa-IR")} تومان` : "");
    return text;
  }

  /**
   * Schedules a reminder for an uncompleted / abandoned order 10 minutes in the future.
   * If a reminder already exists for this paymentId, it updates it.
   */
  static async scheduleAbandonedOrderReminder(params: {
    orderId: number;
    paymentId: string;
    userId: string;
    userPhone: string;
    customerName?: string;
    totalAmount?: number;
    checkoutUrl?: string;
  }) {
    await ensureCRMTables();
    const config = await this.getConfig();
    const delayMinutes = config.delayMinutes || 10;
    const cleanPhone = String(params.userPhone || "").replace(/[^0-9]/g, "");

    const baseUrl = process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://teb-khayyer.ir" : "http://localhost:3000");
    const checkoutUrl = params.checkoutUrl || `${baseUrl}/dashboard/checkout?orderId=${params.orderId}`;

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AbandonedOrderReminder" 
          ("orderId", "paymentId", "userId", "userPhone", "customerName", "totalAmount", "checkoutUrl", "status", "triggerAt", "created_at", "updated_at")
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', now() + ($8 || ' minutes')::interval, now(), now())
         ON CONFLICT ("paymentId")
         DO UPDATE SET 
          "status" = 'PENDING',
          "orderId" = $1,
          "userPhone" = $4,
          "customerName" = $5,
          "totalAmount" = $6,
          "checkoutUrl" = $7,
          "triggerAt" = now() + ($8 || ' minutes')::interval,
          "updated_at" = now()`,
        params.orderId,
        params.paymentId,
        params.userId,
        cleanPhone,
        params.customerName || "مشتری گرامی",
        params.totalAmount || 0,
        checkoutUrl,
        `${delayMinutes}`
      );
    } catch (e) {
      console.warn("Failed to schedule abandoned order reminder:", e);
    }
  }

  /**
   * Marks a reminder as COMPLETED when the order is successfully paid.
   */
  static async markOrderCompleted(paymentIdOrOrderId: string | number) {
    await ensureCRMTables();
    try {
      if (typeof paymentIdOrOrderId === "number") {
        await prisma.$executeRawUnsafe(
          `UPDATE "AbandonedOrderReminder" SET "status" = 'COMPLETED', "updated_at" = now() WHERE "orderId" = $1 AND "status" = 'PENDING'`,
          paymentIdOrOrderId
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE "AbandonedOrderReminder" SET "status" = 'COMPLETED', "updated_at" = now() WHERE "paymentId" = $1 AND "status" = 'PENDING'`,
          paymentIdOrOrderId
        );
      }
    } catch (e) {
      console.warn("markOrderCompleted failed:", e);
    }
  }

  /**
   * Marks a reminder as CANCELED if customer or admin explicitly cancels the order.
   */
  static async markOrderCanceled(orderId: number) {
    await ensureCRMTables();
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "AbandonedOrderReminder" SET "status" = 'CANCELED', "updated_at" = now() WHERE "orderId" = $1 AND "status" = 'PENDING'`,
        orderId
      );
    } catch (e) {
      console.warn("markOrderCanceled failed:", e);
    }
  }

  /**
   * Processes all pending reminders whose trigger time has arrived (triggerAt <= now()).
   * Checks order and payment status before sending to prevent false or duplicate reminders.
   */
  static async processDueReminders(): Promise<{
    processed: number;
    sent: number;
    completedOrCanceled: number;
    skipped: number;
  }> {
    await ensureCRMTables();
    const config = await this.getConfig();

    const dueReminders = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "AbandonedOrderReminder"
      WHERE "status" = 'PENDING' AND "triggerAt" <= now()
      ORDER BY "triggerAt" ASC
      LIMIT 50
    `);

    let sent = 0;
    let completedOrCanceled = 0;
    let skipped = 0;

    for (const reminder of dueReminders || []) {
      // 1. Verify if associated payment is already completed
      const payment = await prisma.payment.findUnique({
        where: { id: reminder.paymentId },
      });

      if (payment && payment.receipt) {
        // Payment was completed!
        await prisma.$executeRawUnsafe(
          `UPDATE "AbandonedOrderReminder" SET "status" = 'COMPLETED', "updated_at" = now() WHERE "id" = $1`,
          reminder.id
        );
        completedOrCanceled++;
        continue;
      }

      // 2. Verify if associated order is canceled or already completed
      if (reminder.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: reminder.orderId },
        });

        if (order) {
          if (order.status === "CANCELED") {
            await prisma.$executeRawUnsafe(
              `UPDATE "AbandonedOrderReminder" SET "status" = 'CANCELED', "updated_at" = now() WHERE "id" = $1`,
              reminder.id
            );
            completedOrCanceled++;
            continue;
          }
          if (order.status !== "PENDING") {
            await prisma.$executeRawUnsafe(
              `UPDATE "AbandonedOrderReminder" SET "status" = 'COMPLETED', "updated_at" = now() WHERE "id" = $1`,
              reminder.id
            );
            completedOrCanceled++;
            continue;
          }
        }
      }

      // 3. Prevent duplicate spam: check if user received an SMS in last 2 hours
      const recentSms = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id FROM "SmsLog"
         WHERE "phone" = $1 AND "status" = 'SENT' AND "created_at" >= now() - interval '2 hours'
         LIMIT 1`,
        reminder.userPhone
      );

      if (recentSms && recentSms.length > 0) {
        await prisma.$executeRawUnsafe(
          `UPDATE "AbandonedOrderReminder" SET "status" = 'SKIPPED', "failureReason" = 'جلوگیری از ارسال تکراری در فاصله ۲ ساعت اخیر', "updated_at" = now() WHERE "id" = $1`,
          reminder.id
        );
        skipped++;
        continue;
      }

      // 4. Construct SMS text from template
      const smsMessage = this.renderTemplate(config.template, {
        name: reminder.customerName || "همراه",
        orderId: reminder.orderId,
        link: reminder.checkoutUrl,
        amount: reminder.totalAmount,
      });

      // 5. Send or log SMS
      const sendRes = await this.sendSms({
        to: reminder.userPhone,
        message: smsMessage,
      });

      if (sendRes.success) {
        await prisma.$executeRawUnsafe(
          `UPDATE "AbandonedOrderReminder" 
           SET "status" = 'SENT', "sentAt" = now(), "smsText" = $2, "updated_at" = now()
           WHERE "id" = $1`,
          reminder.id,
          smsMessage
        );
        sent++;
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE "AbandonedOrderReminder" 
           SET "status" = $2, "smsText" = $3, "failureReason" = $4, "updated_at" = now()
           WHERE "id" = $1`,
          reminder.id,
          sendRes.status === "DISABLED_OR_NOT_CONFIGURED" ? "DISABLED" : "FAILED",
          smsMessage,
          sendRes.reason || "خطای ارسال"
        );
      }
    }

    return {
      processed: dueReminders?.length || 0,
      sent,
      completedOrCanceled,
      skipped,
    };
  }
}
