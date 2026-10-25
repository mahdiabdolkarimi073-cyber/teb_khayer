"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconUser,
  IconShoppingCart,
  IconTruckDelivery,
  IconMapPin,
  IconHeadphones,
  IconClock,
  IconShieldCheck,
  IconArrowLeft,
  IconBarcode,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconRefresh,
  IconAlertCircle,
  IconCircleCheck,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { formatPersianCurrency, formatPersianNumber, toPersianDateTime } from "@/utils/format";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import { reorderPastOrder } from "@/app/(web)/dashboard/orders/reorder.action";
import { bulkSetLocalCart } from "@/utils/localCart";
import { useRouter } from "next/navigation";

interface DashboardHomeViewProps {
  user: any;
  orders: any[];
  addressesCount: number;
  tickets: any[];
  lastLogin: {
    id: number;
    created_at: string;
    ip: string;
    userAgent: string;
  } | null;
}

export default function DashboardHomeView({
  user,
  orders = [],
  addressesCount = 0,
  tickets = [],
  lastLogin,
}: DashboardHomeViewProps) {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "SENDED");
  const openTickets = tickets.filter((t) => t.status !== "CLOSED");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleQuickReorder = async (orderId: number) => {
    setReorderingId(orderId);
    try {
      const res = await reorderPastOrder(orderId);
      if (res.success) {
        const available = res.items
          .filter((i) => i.isAvailable && i.availableCount > 0)
          .map((i) => ({
            product: { id: i.productId, name: i.name, price: i.currentPrice },
            quantity: i.availableCount,
          }));
        bulkSetLocalCart(available);
        router.push("/dashboard/cart");
      } else {
        alert(res.message);
      }
    } catch {
      alert("خطا در بررسی سفارش");
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 p-1 flex-shrink-0">
            <img
              src={user?.avatar || "/backend/images/default_avatar.png"}
              alt={user?.name || "کاربر"}
              className="w-full h-full rounded-xl object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/backend/images/default_avatar.png";
              }}
            />
          </div>
          <div>
            <span className="text-xs text-blue-200">به پنل کاربری خوش آمدید</span>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">{user?.name || "کاربر گرامی طِب خیّر"}</h1>
            <p className="text-xs text-blue-100 font-mono mt-1">شماره تماس: 0{user?.phone}</p>
          </div>
        </div>

        {/* Security & Last Login Widget */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-xs space-y-1.5 self-stretch md:self-auto min-w-[270px]">
          <div className="flex items-center justify-between text-blue-200 font-bold border-b border-white/10 pb-1.5">
            <span className="flex items-center gap-1.5">
              <IconDeviceDesktop size={15} />
              <span>آخرین ورود موفق به حساب:</span>
            </span>
            <IconShieldCheck size={16} className="text-emerald-400" />
          </div>

          {lastLogin ? (
            <div className="space-y-1 text-white">
              <div className="flex justify-between">
                <span className="text-blue-200 text-[11px]">زمان:</span>
                <span className="font-medium">{toPersianDateTime(lastLogin.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-[11px]">دستگاه:</span>
                <span className="truncate max-w-[170px] text-[11px] text-blue-100">
                  {lastLogin.userAgent.includes("Mobile") ? "گوشی موبایل" : "رایانه / مرورگر وب"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-blue-100 text-[11px]">
              ورود شما در نشست جاری تأیید گردید و در امنیت کامل قرار دارد.
            </p>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <Link
          href="/dashboard/orders"
          className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-blue-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold text-gray-500">سفارشات من</span>
            <IconTruckDelivery size={22} className="group-hover:scale-110 transition" />
          </div>
          <strong className="text-2xl font-black text-gray-900">
            {formatPersianNumber(orders.length)}
          </strong>
          <span className="text-[11px] text-blue-600 mt-1 font-bold">
            {pendingOrders.length > 0 ? `${formatPersianNumber(pendingOrders.length)} سفارش جاری` : "مشاهده تاریخچه ←"}
          </span>
        </Link>

        <Link
          href="/dashboard/cart"
          className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-emerald-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-gray-500">سبد خرید من</span>
            <IconShoppingCart size={22} className="group-hover:scale-110 transition" />
          </div>
          <strong className="text-2xl font-black text-emerald-700">ذخیره‌شده</strong>
          <span className="text-[11px] text-emerald-600 mt-1 font-bold">
            حفظ‌شده برای مراجعات بعدی ←
          </span>
        </Link>

        <Link
          href="/dashboard/addresses"
          className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-purple-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold text-gray-500">نشانی‌های ارسال</span>
            <IconMapPin size={22} className="group-hover:scale-110 transition" />
          </div>
          <strong className="text-2xl font-black text-purple-800">
            {formatPersianNumber(addressesCount)}
          </strong>
          <span className="text-[11px] text-purple-600 mt-1 font-bold">
            مدیریت چند نشانی ←
          </span>
        </Link>

        <Link
          href="/dashboard/support"
          className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-amber-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-gray-500">پشتیبانی و تیکت‌ها</span>
            <IconHeadphones size={22} className="group-hover:scale-110 transition" />
          </div>
          <strong className="text-2xl font-black text-amber-800">
            {formatPersianNumber(tickets.length)}
          </strong>
          <span className="text-[11px] text-amber-700 mt-1 font-bold">
            {openTickets.length > 0 ? `${formatPersianNumber(openTickets.length)} تیکت باز` : "ثبت درخواست جدید ←"}
          </span>
        </Link>

      </div>

      {/* Recent Orders with Postal Tracking & Re-order */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <IconTruckDelivery size={20} className="text-blue-600" />
              <span>آخرین سفارشات و رهگیری مرسوله‌ها</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">مشاهده کد رهگیری ۲۴ رقمی پستی و امکان خرید مجدد اقلام</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>همه سفارشات</span>
            <IconArrowLeft size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            هنوز سفارشی در سامانه طِب خیّر ثبت نکرده‌اید.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => {
              let rawInfo: any = {};
              try {
                rawInfo = typeof order.info === "string" ? JSON.parse(order.info) : (order.info || {});
              } catch {
                rawInfo = {};
              }

              const trackingCode = rawInfo?.trackingCode || rawInfo?.postalCode || rawInfo?.trackingBarcode;

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition text-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">سفارش #{formatPersianNumber(order.id)}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        {OrderStatusEnum[order.status as keyof typeof OrderStatusEnum] || order.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono">{toPersianDateTime(order.created_at)}</span>
                      <span className="font-black text-blue-700 text-sm">
                        {formatPersianCurrency(order.payment?.amount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Postal Tracking Strip */}
                  {trackingCode && (
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50/80 p-2.5 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 font-mono">
                        <IconBarcode size={16} className="text-blue-600" />
                        <span className="text-gray-600 font-sans text-xs">کد رهگیری پست پیشتاز:</span>
                        <strong className="text-blue-900 font-bold">{trackingCode}</strong>
                        <button
                          type="button"
                          onClick={() => copyCode(trackingCode)}
                          className="text-gray-500 hover:text-blue-600 p-1 rounded"
                          title="کپی کد رهگیری"
                        >
                          {copiedCode === trackingCode ? <IconCheck size={14} className="text-emerald-600" /> : <IconCopy size={14} />}
                        </button>
                      </div>

                      <a
                        href={`https://tracking.post.ir/?id=${trackingCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition"
                      >
                        <span>سامانه رهگیری پست</span>
                        <IconExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {/* Actions: Re-order & View Details */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>تعداد اقلام: {formatPersianNumber(order.products?.length || 0)} محصول</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickReorder(order.id)}
                        disabled={reorderingId === order.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold transition"
                      >
                        <IconRefresh size={13} className={reorderingId === order.id ? "animate-spin" : ""} />
                        <span>{reorderingId === order.id ? "بررسی موجودی..." : "خرید مجدد این سفارش"}</span>
                      </button>

                      <Link
                        href="/dashboard/orders"
                        className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold transition"
                      >
                        فاکتور و جزئیات
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Support Inquiries Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <IconHeadphones size={20} className="text-blue-600" />
              <span>وضعیت درخواست‌ها و شکایات من</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">مشاهده پاسخ‌های پشتیبانی و ثبت تیکت جدید</p>
          </div>
          <Link
            href="/dashboard/support"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>ورود به پشتیبانی</span>
            <IconArrowLeft size={14} />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-xs">
            درخواست پشتیبانی بازی ندارید.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tickets.slice(0, 2).map((ticket) => (
              <div key={ticket.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 truncate">{ticket.subject}</span>
                  <span className="text-[10px] font-mono text-gray-400">#{ticket.ticketNumber}</span>
                </div>
                <p className="text-gray-600 line-clamp-2">{ticket.message}</p>
                {ticket.adminReply ? (
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-100 text-emerald-900 text-[11px]">
                    <span className="font-bold">پاسخ پشتیبانی: </span>
                    <span className="line-clamp-2">{ticket.adminReply}</span>
                  </div>
                ) : (
                  <span className="text-amber-700 text-[11px] block">در حال بررسی توسط کارشناسان...</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
