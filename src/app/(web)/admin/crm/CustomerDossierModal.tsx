"use client";

import React, { useEffect, useState } from "react";
import {
  IconX,
  IconUser,
  IconPhone,
  IconCalendar,
  IconShoppingBag,
  IconCurrencyDollar,
  IconMapPin,
  IconBook2,
  IconFileText,
  IconTruckDelivery,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconExternalLink,
} from "@tabler/icons-react";
import { formatPersianCurrency, formatPersianNumber, toPersianDateTime } from "@/utils/format";
import { getCustomerDossier } from "./crm.action";
import Link from "next/link";

interface CustomerDossierModalProps {
  userId: string;
  onClose: () => void;
}

export default function CustomerDossierModal({ userId, onClose }: CustomerDossierModalProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCustomerDossier(userId).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <IconUser size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                پرونده جامع مشتری (CRM Dossier)
              </h3>
              <p className="text-xs text-gray-500 font-mono">شناسه کاربری: {userId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition"
            aria-label="بستن"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <p>در حال بارگذاری اطلاعات پرونده مشتری...</p>
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-gray-500">
              <p>اطلاعات کاربری یافت نشد.</p>
            </div>
          ) : (
            <>
              {/* Profile Card & KPI Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* User Info */}
                <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{data.user.name}</h4>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <IconPhone size={14} className="text-blue-600" />
                        <span className="font-mono dir-ltr">{data.user.phone}</span>
                      </p>
                      {data.user.email && (
                        <p className="text-xs text-gray-600 mt-1">ایمیل: {data.user.email}</p>
                      )}
                      {data.lastLogin && (
                        <p className="text-[11px] text-blue-700 bg-blue-50/80 px-2 py-1 rounded border border-blue-100 mt-2">
                          <strong>آخرین ورود موفق: </strong>
                          <span>{toPersianDateTime(data.lastLogin.created_at)}</span>
                          <span className="text-gray-500 mr-2">({data.lastLogin.userAgent?.includes("Mobile") ? "موبایل" : "رایانه"})</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                        {data.user.role === "ADMIN" ? "مدیر سیستم" : "مشتری فروشگاه"}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        عضویت: {data.user.date ? toPersianDateTime(data.user.date).split("،")[0] : "-"}
                      </span>
                    </div>
                  </div>

                  {/* Direct Contact Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-blue-100">
                    <a
                      href={`tel:${data.user.phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                    >
                      <IconPhone size={14} />
                      <span>تماس تلفنی</span>
                    </a>
                    <a
                      href={`sms:${data.user.phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      <span>ارسال پیامک</span>
                    </a>
                  </div>
                </div>

                {/* Lifetime Metrics */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <span className="text-xs text-gray-500 font-medium">مجموع خریدهای موفق</span>
                  <strong className="text-xl font-black text-blue-700 my-1">
                    {formatPersianCurrency(data.metrics.totalSuccessfulSpent)}
                  </strong>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block">کل سفارشات</span>
                      <strong className="text-gray-800 text-xs font-bold">
                        {formatPersianNumber(data.metrics.totalOrders)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 block">موفق</span>
                      <strong className="text-emerald-700 text-xs font-bold">
                        {formatPersianNumber(data.metrics.successfulOrders)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 block">جاری/انتظار</span>
                      <strong className="text-amber-700 text-xs font-bold">
                        {formatPersianNumber(data.metrics.pendingOrders)}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Saved Addresses */}
              <div>
                <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5 mb-2.5">
                  <IconMapPin size={16} className="text-blue-600" />
                  <span>آدرس‌های ثبت‌شده مشتری ({formatPersianNumber(data.addresses.length)})</span>
                </h4>
                {data.addresses.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                    هیچ آدرسی در پروفایل این مشتری ثبت نشده است.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.addresses.map((addr: any) => (
                      <div
                        key={addr.id}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1 relative"
                      >
                        {addr.isDefault && (
                          <span className="absolute top-2 left-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            پیش‌فرض
                          </span>
                        )}
                        <p className="font-bold text-gray-800">{addr.title} - گیرنده: {addr.name}</p>
                        <p className="text-gray-600">استان: {addr.state} | شهر: {addr.city}</p>
                        <p className="text-gray-700 line-clamp-2">{addr.address}</p>
                        <p className="text-gray-500 font-mono">کد پستی: {formatPersianNumber(addr.zipcode || "-")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5 mb-2.5">
                  <IconShoppingBag size={16} className="text-blue-600" />
                  <span>تاریخچه کامل سفارشات ({formatPersianNumber(data.orders.length)})</span>
                </h4>
                {data.orders.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                    این کاربر هنوز سفارشی ثبت نکرده است.
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                    {data.orders.map((ord: any) => (
                      <div key={ord.id} className="p-3.5 hover:bg-gray-50/80 transition text-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">سفارش #{formatPersianNumber(ord.id)}</span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                                ord.status === "DELAY"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ord.status === "SENDED"
                                  ? "bg-blue-100 text-blue-800"
                                  : ord.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ord.status === "DELAY"
                                ? "تحویل شده"
                                : ord.status === "SENDED"
                                ? "ارسال شده"
                                : ord.status === "PENDING"
                                ? "در حال آماده‌سازی"
                                : "لغو شده"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-gray-500">
                              {toPersianDateTime(ord.created_at)}
                            </span>
                            <span className="font-bold text-blue-700">
                              {formatPersianCurrency(ord.payment?.amount || 0)}
                            </span>
                          </div>
                        </div>

                        {/* Postal Tracking in Dossier */}
                        {ord.trackingCode && (
                          <div className="bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-200 flex items-center justify-between text-[11px]">
                            <span className="text-gray-700">
                              کد رهگیری پستی: <strong className="font-mono text-blue-900">{ord.trackingCode}</strong>
                            </span>
                            <a
                              href={`https://tracking.post.ir/?id=${ord.trackingCode}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 hover:underline font-bold"
                            >
                              سامانه رهگیری پست ↗
                            </a>
                          </div>
                        )}

                        {/* Items preview */}
                        {ord.products?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {ord.products.map((p: any) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 rounded text-[11px] text-gray-700"
                              >
                                <span>{p.productName}</span>
                                <span className="text-blue-600 font-bold">({formatPersianNumber(p.count)}×)</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Support Inquiries & Tickets Section */}
              <div>
                <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5 mb-2.5">
                  <IconFileText size={16} className="text-blue-600" />
                  <span>تیکت‌ها، شکایات و سؤالات مشتری ({formatPersianNumber(data.tickets?.length || 0)})</span>
                </h4>
                {!data.tickets || data.tickets.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                    این کاربر تاکنون تیکت یا شکایتی ثبت نکرده است.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.tickets.map((t: any) => (
                      <div key={t.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{t.subject}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {t.status === "ANSWERED" ? "پاسخ داده شده" : t.status === "PENDING" ? "در انتظار بررسی" : t.status}
                          </span>
                        </div>
                        <p className="text-gray-700">{t.message}</p>
                        {t.adminReply && (
                          <div className="p-2 bg-emerald-50 rounded border border-emerald-100 text-emerald-900 text-[11px] mt-1">
                            <strong>پاسخ ثبت‌شده ادمین: </strong>
                            <span>{t.adminReply}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Courses Enrolled */}
              {data.courses?.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5 mb-2.5">
                    <IconBook2 size={16} className="text-blue-600" />
                    <span>دوره‌های آموزشی ثبت‌نام‌شده ({formatPersianNumber(data.courses.length)})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.courses.map((c: any) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg border border-purple-100 bg-purple-50/50 flex justify-between items-center text-xs"
                      >
                        <span className="font-medium text-purple-950">{c.name}</span>
                        <span className="text-[11px] text-purple-700 font-mono">
                          {toPersianDateTime(c.enrolledAt).split("،")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}
        </div>

      </div>
    </div>
  );
}
