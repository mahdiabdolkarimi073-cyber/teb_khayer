import React from "react";
import { SmsManagerTab } from "@/components/admin/SmsManagerTab";

export const metadata = {
  title: "پنل و وب‌سرویس پیامک - مدیریت طِب خیّر",
  description: "مدیریت تنظیمات وب‌سرویس پیامک، الگوهای پیامکی، ارسال دستی و یادآوری سفارشات ناتمام",
};

export default function AdminSmsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">
          سامانه وب‌سرویس پیامکی و اطلاع‌رسانی
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          تنظیمات درگاه‌های پیامکی (sms.ir، کاوه‌نگار، فراز اس‌ام‌اس)، یادآوری سفارشات رهاشده و گزارش ارسال‌ها
        </p>
      </div>

      <SmsManagerTab />
    </div>
  );
}
