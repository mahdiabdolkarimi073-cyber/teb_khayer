import React from "react";
import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { redirect } from "next/navigation";
import { getCustomerDossier } from "@/app/(web)/admin/crm/crm.action";
import { formatPersianCurrency, formatPersianNumber, toPersianDateTime } from "@/utils/format";
import Link from "next/link";
import {
  IconArrowLeft,
  IconUser,
  IconPhone,
  IconMapPin,
  IconShoppingBag,
  IconBook2,
  IconHome,
  IconBriefcase,
  IconHistory,
  IconStarFilled,
} from "@tabler/icons-react";

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function CustomerDossierPage(props: PageProps) {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const resolvedParams =
    typeof (props.params as any)?.then === "function" || props.params instanceof Promise
      ? await props.params
      : props.params;

  const customerId = resolvedParams?.id;
  if (!customerId) return <div>شناسه کاربر نامعتبر است.</div>;

  const data = await getCustomerDossier(customerId);
  if (!data) return <div className="p-8 text-center text-gray-500">مشتری مورد نظر یافت نشد.</div>;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <IconUser size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">پرونده مشتری: {data.user.name}</h1>
            <p className="text-xs text-gray-500 font-mono">شناسه: {data.user.id}</p>
          </div>
        </div>

        <Link
          href="/admin/crm"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition"
        >
          <span>بازگشت به CRM</span>
          <IconArrowLeft size={16} />
        </Link>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">{data.user.name}</h3>
            <p className="text-sm text-gray-700 flex items-center gap-2">
              <IconPhone size={16} className="text-blue-600" />
              <span className="font-mono dir-ltr">{data.user.phone}</span>
            </p>
            {data.user.email && (
              <p className="text-xs text-gray-600">ایمیل: {data.user.email}</p>
            )}
            <p className="text-xs text-gray-500">
              تاریخ عضویت: {data.user.date ? toPersianDateTime(data.user.date).split("،")[0] : "-"}
            </p>
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-blue-100">
            <a
              href={`tel:${data.user.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
            >
              <IconPhone size={14} />
              <span>تماس تلفنی با مشتری</span>
            </a>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs text-gray-500 font-medium">مجموع خریدهای موفق</span>
          <strong className="text-2xl font-black text-blue-700 my-1">
            {formatPersianCurrency(data.metrics.totalSuccessfulSpent)}
          </strong>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 text-center text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block">کل سفارش‌ها</span>
              <strong className="text-gray-800">{formatPersianNumber(data.metrics.totalOrders)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 block">موفق</span>
              <strong className="text-emerald-700">{formatPersianNumber(data.metrics.successfulOrders)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-amber-600 block">جاری</span>
              <strong className="text-amber-700">{formatPersianNumber(data.metrics.pendingOrders)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section (Req 4, 5, 6, 8) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <IconMapPin size={18} className="text-blue-600" />
            <span>آدرس‌های مشتری و نشانی‌های تحویل کالا ({formatPersianNumber(data.addresses.length)})</span>
          </h3>
          {data.orderAddresses?.length > 0 && (
            <span className="text-[11px] text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
              {formatPersianNumber(data.orderAddresses.length)} نشانی در فاکتور سفارش‌ها
            </span>
          )}
        </div>

        {data.addresses.length === 0 ? (
          <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-1">
            <IconMapPin size={24} className="text-gray-400 mx-auto" />
            <p className="text-xs font-bold text-gray-700">آدرسی برای این مشتری ثبت نشده است</p>
            <p className="text-[11px] text-gray-400">این مشتری هنوز هیچ آدرسی را در حساب کاربری خود ثبت نکرده است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.addresses.map((a: any) => (
              <div
                key={a.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition ${
                  a.isDefault
                    ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200"
                    : "bg-gray-50/70 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-1 pb-1 border-b border-black/5">
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    {a.title === "محل کار" ? <IconBriefcase size={14} className="text-blue-600" /> : <IconHome size={14} className="text-blue-600" />}
                    <span>{a.title || "منزل"}</span>
                  </span>
                  {a.isDefault && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                      <IconStarFilled size={10} />
                      پیش‌فرض
                    </span>
                  )}
                </div>

                <div className="text-gray-800">
                  <strong>نام گیرنده: </strong>
                  <span>{a.name}</span>
                </div>

                <div className="text-gray-700">
                  <strong>شماره تماس: </strong>
                  <a href={`tel:${a.phone}`} className="font-mono dir-ltr text-blue-700 font-bold hover:underline">
                    {a.phone}
                  </a>
                </div>

                <p className="text-gray-600">
                  <strong>استان و شهر: </strong>
                  <span>{a.state} - {a.city}</span>
                </p>

                <div className="text-gray-800 bg-white/80 p-2 rounded-lg border border-gray-200 leading-relaxed text-[11px]">
                  <strong>آدرس کامل: </strong>
                  <span>{a.address}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>کد پستی: <strong className="font-mono text-gray-800 font-bold">{a.zipcode ? formatPersianNumber(a.zipcode) : "ثبت نشده"}</strong></span>
                  {a.created_at && (
                    <span className="text-[10px] text-gray-400 font-mono">
                      ثبت: {toPersianDateTime(a.created_at).split("،")[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Historical Order Delivery Addresses */}
        {data.orderAddresses?.length > 0 && (
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1">
              <IconHistory size={14} className="text-purple-600" />
              <span>تاریخچه نشانی‌های ثبت‌شده در فاکتور سفارش‌ها ({formatPersianNumber(data.orderAddresses.length)}):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {data.orderAddresses.map((ordAddr: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-purple-950 pb-1 border-b border-purple-100">
                    <span>فاکتور #{formatPersianNumber(ordAddr.orderId)}</span>
                    <span className="font-mono text-[10px] text-purple-700 font-normal">
                      {toPersianDateTime(ordAddr.orderDate).split("،")[0]}
                    </span>
                  </div>
                  <div>گیرنده: <strong>{ordAddr.name}</strong> ({ordAddr.phone})</div>
                  <div>مقصد: {ordAddr.state}، {ordAddr.city}</div>
                  <div className="bg-white/80 p-1.5 rounded border border-purple-100 text-gray-700">{ordAddr.address}</div>
                  {ordAddr.zipcode && <div className="text-gray-500 font-mono">کد پستی: {formatPersianNumber(ordAddr.zipcode)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <IconShoppingBag size={18} className="text-blue-600" />
          <span>سوابق خرید و سفارشات ({formatPersianNumber(data.orders.length)})</span>
        </h3>
        {data.orders.length === 0 ? (
          <p className="text-xs text-gray-400">هیچ سفارشی ثبت نشده است.</p>
        ) : (
          <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
            {data.orders.map((o: any) => (
              <div key={o.id} className="p-4 hover:bg-gray-50 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">سفارش #{formatPersianNumber(o.id)}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gray-500">{toPersianDateTime(o.created_at)}</span>
                    <span className="font-bold text-blue-700">
                      {formatPersianCurrency(o.payment?.amount || 0)}
                    </span>
                  </div>
                </div>
                {o.products?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {o.products.map((p: any) => (
                      <span key={p.id} className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[11px]">
                        {p.productName} ({formatPersianNumber(p.count)} عدد)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
