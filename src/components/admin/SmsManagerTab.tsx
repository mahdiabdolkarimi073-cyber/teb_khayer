"use client";

import React, { useState, useEffect } from "react";
import {
  IconMessage,
  IconSend,
  IconSettings,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconRefresh,
  IconPhone,
  IconExternalLink,
  IconCheck,
} from "@tabler/icons-react";
import {
  getSmsDashboardData,
  saveSmsConfig,
  manualProcessReminders,
} from "@/app/(web)/admin/crm/crm.action";
import { formatPersianCurrency, formatPersianNumber, toPersianDateTime } from "@/utils/format";

export function SmsManagerTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form State
  const [isEnabled, setIsEnabled] = useState(false);
  const [provider, setProvider] = useState("sms.ir");
  const [apiKey, setApiKey] = useState("");
  const [lineNumber, setLineNumber] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [template, setTemplate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSmsDashboardData();
      setData(res);
      if (res?.config) {
        setIsEnabled(res.config.isEnabled);
        setProvider(res.config.provider || "sms.ir");
        setApiKey(res.config.apiKey || "");
        setLineNumber(res.config.lineNumber || "");
        setDelayMinutes(res.config.delayMinutes || 10);
        setTemplate(res.config.template || "");
      }
    } catch (e) {
      console.error("Failed to load SMS dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await saveSmsConfig({
        isEnabled,
        provider,
        apiKey,
        lineNumber,
        delayMinutes: Number(delayMinutes) || 10,
        template,
      });
      setSaveMessage(res.message);
      await fetchData();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage("خطا در ذخیره تنظیمات پیامک");
    } finally {
      setSaving(false);
    }
  };

  const handleProcessNow = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      const res = await manualProcessReminders();
      setProcessResult(res);
      await fetchData();
    } catch (e: any) {
      setProcessResult({ error: e?.message || "خطا در پردازش صف" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center text-gray-500 font-bold text-sm">در حال بارگذاری اطلاعات پنل پیامک...</div>;
  }

  const isConfigured = Boolean(apiKey.trim() && isEnabled);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          isConfigured
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isConfigured ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
            }`}
          >
            <IconMessage size={22} />
          </div>
          <div>
            <h3 className="font-black text-sm">
              وضعیت وب‌سرویس پیامکی:{" "}
              {isConfigured ? "فعال و آماده ارسال" : "غیرفعال (در انتظار تنظیم اطلاعات پنل پیامکی)"}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {isConfigured
                ? `سامانه فعال: ${provider} | خط ارسال: ${lineNumber || "خط پیش‌فرض سامانه"}`
                : "ارسال واقعی پیامک جهت جلوگیری از خطای وب‌سرویس غیرفعال است. پس از دریافت API Key می‌توانید آن را در فرم زیر فعال نمایید."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleProcessNow}
            disabled={processing}
            className="px-3.5 py-2 bg-white text-gray-800 border border-gray-300 rounded-xl text-xs font-bold shadow-xs hover:bg-gray-50 flex items-center gap-1.5 transition-all"
          >
            <IconRefresh size={15} className={processing ? "animate-spin" : ""} />
            <span>{processing ? "در حال پردازش..." : "بررسی و ارسال فوری صف"}</span>
          </button>
        </div>
      </div>

      {processResult && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center justify-between">
          <span>
            نتیجه بررسی صف: {processResult.processed} مورد بررسی شد | {processResult.sent} پیامک ارسال شد |{" "}
            {processResult.completedOrCanceled} سفارش نهایی/لغو شده | {processResult.skipped} نادیده گرفته شد.
          </span>
          <button type="button" onClick={() => setProcessResult(null)} className="text-blue-600 font-bold">
            بستن
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] text-gray-500 block">کل تلاش‌های ناتمام</span>
          <strong className="text-base font-black text-gray-900 mt-1 block">
            {formatPersianNumber(data?.stats?.total || 0)}
          </strong>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] text-amber-600 block font-bold">در انتظار موعد (۱۰ دقیقه)</span>
          <strong className="text-base font-black text-amber-700 mt-1 block">
            {formatPersianNumber(data?.stats?.pending || 0)}
          </strong>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] text-blue-600 block font-bold">پیامک ارسال شده</span>
          <strong className="text-base font-black text-blue-700 mt-1 block">
            {formatPersianNumber(data?.stats?.sent || 0)}
          </strong>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] text-emerald-600 block font-bold">تکمیل شده توسط مشتری</span>
          <strong className="text-base font-black text-emerald-700 mt-1 block">
            {formatPersianNumber(data?.stats?.completed || 0)}
          </strong>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] text-red-600 block font-bold">لغو شده / منصرف</span>
          <strong className="text-base font-black text-red-700 mt-1 block">
            {formatPersianNumber(data?.stats?.canceled || 0)}
          </strong>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-800 font-black text-sm">
            <IconSettings size={18} />
            <span>تنظیمات وب‌سرویس پیامک و یادآوری خرید ناتمام</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-gray-700">ارسال خودکار پیامک فعال باشد</span>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">سامانه پیامکی:</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white"
            >
              <option value="sms.ir">سامانه ایده پردازان (sms.ir)</option>
              <option value="kavenegar">سامانه کاوه‌نگار (kavenegar.com)</option>
              <option value="farazsms">سامانه فراز اس‌ام‌اس / IPPanel</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">کلید دسترسی (API Key / Token):</label>
            <input
              type="password"
              dir="ltr"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="کلید API دریافت شده از پنل پیامکی..."
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">شماره خط اختصاصی ارسال:</label>
            <input
              type="text"
              dir="ltr"
              value={lineNumber}
              onChange={(e) => setLineNumber(e.target.value)}
              placeholder="مثال: 3000..."
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1 sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700">تأخیر ارسال پیامک (دقیقه):</label>
            <input
              type="number"
              min={1}
              max={120}
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
            />
            <span className="text-[10px] text-gray-500 block">پیش‌فرض: ۱۰ دقیقه پس از انصراف/عدم موفقیت</span>
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="block text-xs font-bold text-gray-700">
              قالب متن پیامک یادآوری خرید (پشتیبانی از متغیرهای پویا):
            </label>
            <textarea
              rows={3}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="{name} عزیز، خرید شما ناتمام ماند! جهت ادامه روی لینک کلیک کنید: {link}"
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
            />
            <div className="flex flex-wrap gap-2 text-[10px] text-gray-600 mt-1">
              <span>متغیرهای مجاز:</span>
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{"{name}"}</code> (نام مشتری)
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{"{orderId}"}</code> (شماره سفارش)
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{"{link}"}</code> (لینک مستقیم سفارش)
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{"{amount}"}</code> (مبلغ سفارش)
            </div>
          </div>
        </div>

        {saveMessage && (
          <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-bold">
            {saveMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-xs"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات پیامک"}
          </button>
        </div>
      </form>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800 font-black text-sm">
            <IconClock size={18} />
            <span>صف و سوابق یادآوری سفارشات ناتمام</span>
          </div>
          <span className="text-xs text-gray-500">
            ۳۰ مورد اخیر ثبت شده در سیستم
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-2.5">سفارش</th>
                <th className="p-2.5">مشتری و تلفن</th>
                <th className="p-2.5">مبلغ</th>
                <th className="p-2.5">وضعیت</th>
                <th className="p-2.5">زمان ثبت</th>
                <th className="p-2.5">موعد ارسال (۱۰ دقیقه)</th>
                <th className="p-2.5">جزئیات / متن پیامک</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.reminders?.map((r: any) => {
                const isSent = r.status === "SENT";
                const isCompleted = r.status === "COMPLETED";
                const isCanceled = r.status === "CANCELED";
                const isPending = r.status === "PENDING";

                return (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="p-2.5 font-bold font-mono">#{r.orderId || "-"}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-gray-900">{r.customerName}</div>
                      <div className="text-[11px] text-gray-500 font-mono dir-ltr text-right">{r.userPhone}</div>
                    </td>
                    <td className="p-2.5 font-bold text-gray-800">
                      {formatPersianCurrency(r.totalAmount || 0)}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSent
                            ? "bg-blue-100 text-blue-800"
                            : isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : isCanceled
                            ? "bg-red-100 text-red-800"
                            : isPending
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isSent
                          ? "ارسال شد"
                          : isCompleted
                          ? "خرید تکمیل شد"
                          : isCanceled
                          ? "لغو شده"
                          : isPending
                          ? "در صف انتظار"
                          : r.status === "DISABLED"
                          ? "پنل پیامک غیرفعال"
                          : r.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-500 text-[11px]">{toPersianDateTime(r.created_at)}</td>
                    <td className="p-2.5 text-gray-500 text-[11px] font-mono">{toPersianDateTime(r.triggerAt)}</td>
                    <td className="p-2.5 max-w-[200px] truncate text-[11px] text-gray-600">
                      {r.smsText || r.failureReason || r.checkoutUrl}
                    </td>
                  </tr>
                );
              })}
              {(!data?.reminders || data.reminders.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    هنوز تلاشی برای خرید ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
