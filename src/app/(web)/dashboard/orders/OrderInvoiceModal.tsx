"use client";

import React, { useEffect } from "react";
import {
  IconPrinter,
  IconX,
  IconCheck,
  IconClock,
  IconReceipt,
  IconTruckDelivery,
  IconBuildingStore,
  IconUser,
  IconPhone,
  IconMapPin,
  IconBarcode,
} from "@tabler/icons-react";
import { formatPersianCurrency, formatPersianNumber, toPersianDateTime } from "@/utils/format";

interface OrderInvoiceModalProps {
  order: any;
  onClose: () => void;
}

export default function OrderInvoiceModal({ order, onClose }: OrderInvoiceModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!order) return null;

  const isProforma = order.status === "PENDING";
  const isCanceled = order.status === "CANCELED";
  const isFinal = order.status === "SENDED" || order.status === "DELAY";

  const orderProducts = Array.isArray(order.products) ? order.products : [];
  let rawInfo: any = {};
  try {
    rawInfo = typeof order.info === "string" ? JSON.parse(order.info) : (order.info || {});
  } catch {
    rawInfo = {};
  }

  // Calculate itemized financials
  let calculatedSubtotal = 0;
  let calculatedDiscount = 0;

  const items = orderProducts.map((op: any, index: number) => {
    const product = op?.product || {};
    const count = Number(op?.count || 1);
    const unitPrice = Number(product?.price || 0);
    const originalPrice = Number(product?.originalPrice || unitPrice);
    const itemTotal = unitPrice * count;
    const itemDiscount = Math.max(0, (originalPrice - unitPrice) * count);

    calculatedSubtotal += originalPrice * count;
    calculatedDiscount += itemDiscount;

    return {
      index: index + 1,
      id: op?.id || index + 1,
      name: product?.name || `محصول با شناسه ${op?.productId || "نامشخص"}`,
      count,
      originalPrice,
      unitPrice,
      itemTotal,
      itemDiscount,
    };
  });

  const paymentAmount = Number(order?.payment?.amount || 0);
  const extraDiscount = Number(rawInfo?.discountAmount || rawInfo?.couponDiscount || 0);
  const totalDiscount = calculatedDiscount + extraDiscount;
  const shippingFee = Number(rawInfo?.shippingFee ?? rawInfo?.shippingCost ?? Math.max(0, paymentAmount - (calculatedSubtotal - totalDiscount)));
  const finalPayable = paymentAmount > 0 ? paymentAmount : Math.max(0, calculatedSubtotal - totalDiscount + shippingFee);

  const customerName = order?.user?.name || rawInfo?.receiverName || rawInfo?.name || "کاربر گرامی";
  const customerPhone = order?.user?.phone ? `0${order.user.phone}` : (rawInfo?.phone || rawInfo?.receiverPhone || "-");
  const customerAddress = rawInfo?.address || rawInfo?.fullAddress || "-";
  const customerCity = rawInfo?.city ? `${rawInfo?.state || ""} - ${rawInfo.city}` : (rawInfo?.state || "-");
  const customerZipcode = rawInfo?.zipcode || rawInfo?.postalCode || "-";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Top Action Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2">
            <IconReceipt size={22} className="text-blue-600" />
            <h3 className="font-bold text-gray-800 text-base sm:text-lg">
              {isProforma ? "پیش‌فاکتور سفارش" : isCanceled ? "فاکتور سفارش لغو شده" : "فاکتور رسمی خرید"}
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                isProforma
                  ? "bg-amber-100 text-amber-800"
                  : isCanceled
                  ? "bg-red-100 text-red-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isProforma ? "پیش‌فاکتور (در انتظار تایید/پرداخت)" : isCanceled ? "لغو شده" : "پرداخت و ثبت قطعی"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-xs transition"
            >
              <IconPrinter size={16} />
              <span>چاپ / ذخیره PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition"
              aria-label="بستن"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 sm:p-10 text-gray-800 print:p-4 text-xs sm:text-sm" id="printable-invoice">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-gray-300 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                <IconBuildingStore size={32} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-gray-900">فروشگاه آنلاین و طب سنتی طِب خیّر</h1>
                <p className="text-xs text-gray-500 mt-0.5">مرکز تخصصی گیاهان دارویی، سلامت و فرآورده‌های طبیعی</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
                  <span>تلفن پشتیبانی: ۰۴۵-۳۳۷۹۰۶۶۷</span>
                  <span>وب‌سایت: teb-khayyer.ir</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-left min-w-[210px] print:bg-transparent">
              <div className="text-center sm:text-left mb-2">
                <span className="inline-block text-xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {isProforma ? "پـیـش‌فـاکـتـور خـریـد" : isCanceled ? "فـاکـتـور لـغـو شـده" : "فـاکـتـور فـروش کـالا"}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">شماره فاکتور:</span>
                  <span className="font-bold text-gray-800 dir-ltr font-mono">TK-INV-{order.id}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">شماره سفارش:</span>
                  <span className="font-bold text-gray-800">#{formatPersianNumber(order.id)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">تاریخ صدور:</span>
                  <span className="font-medium text-gray-800">
                    {order.created_at ? toPersianDateTime(order.created_at) : "-"}
                  </span>
                </div>
                {order?.payment?.receipt && (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">کد رهگیری تراکنش:</span>
                    <span className="font-mono text-gray-800 text-[11px]">{order.payment.receipt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer / Consignee Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-gray-200 text-xs">
            <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2 pb-1.5 border-b border-gray-200">
                <IconUser size={15} className="text-blue-600" />
                <span>مشخصات خریدار / مشتری</span>
              </h4>
              <div className="space-y-1.5 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">نام و نام خانوادگی:</span>
                  <span className="font-bold">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">شماره تلفن همراه:</span>
                  <span className="font-medium font-mono">{formatPersianNumber(customerPhone)}</span>
                </div>
                {order?.user?.nationalCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">کد ملی:</span>
                    <span className="font-mono">{formatPersianNumber(order.user.nationalCode)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 flex items-center gap-1.5 mb-2 pb-1.5 border-b border-gray-200">
                <IconMapPin size={15} className="text-blue-600" />
                <span>مشخصات و نشانی تحویل گیرنده</span>
              </h4>
              <div className="space-y-1.5 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">استان و شهر:</span>
                  <span className="font-medium">{customerCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">کد پستی:</span>
                  <span className="font-mono">{formatPersianNumber(customerZipcode)}</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-gray-500 flex-shrink-0">نشانی کامل:</span>
                  <span className="font-medium line-clamp-2">{customerAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="my-5 overflow-x-auto">
            <table className="w-full text-right border-collapse border border-gray-200 rounded-lg overflow-hidden text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                  <th className="py-2.5 px-3 w-12 text-center">ردیف</th>
                  <th className="py-2.5 px-3">نام و شرح کالا / خدمت</th>
                  <th className="py-2.5 px-3 w-20 text-center">تعداد</th>
                  <th className="py-2.5 px-3 w-28 text-left">قیمت واحد (تومان)</th>
                  <th className="py-2.5 px-3 w-24 text-left">تخفیف (تومان)</th>
                  <th className="py-2.5 px-3 w-32 text-left">مبلغ کل (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      هیچ کالایی برای این سفارش ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-center text-gray-500">{formatPersianNumber(item.index)}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{formatPersianNumber(item.count)}</td>
                      <td className="py-2.5 px-3 text-left font-mono">{formatPersianNumber(item.originalPrice)}</td>
                      <td className="py-2.5 px-3 text-left font-mono text-rose-600">
                        {item.itemDiscount > 0 ? formatPersianNumber(item.itemDiscount) : "۰"}
                      </td>
                      <td className="py-2.5 px-3 text-left font-bold text-gray-900 font-mono">
                        {formatPersianNumber(item.itemTotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Status & Terms Note */}
            <div className="flex flex-col justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <h5 className="font-bold text-gray-800 text-xs mb-1.5">توضیحات و شرایط سفارش:</h5>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {isProforma
                    ? "این سند به عنوان پیش‌فاکتور صادر گردیده و پس از پرداخت نهایی و تایید انبار، فاکتور نهایی و بسته تحویل شرکت پست خواهد شد."
                    : "کالاهای مندرج در این فاکتور با ضمانت اصالت و سلامت فیزیکی طِب خیّر بسته‌بندی و ارسال شده‌اند."}
                </p>
                {rawInfo?.note && (
                  <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded mt-2 border border-blue-100">
                    <span className="font-bold">یادداشت مشتری: </span>
                    {rawInfo.note}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                <span>مهر و امضای فروشگاه طِب خیّر</span>
                <span className="font-bold text-emerald-700">
                  {isFinal ? "✓ پرداخت شده و معتبر" : isProforma ? "در انتظار پرداخت" : "لغو گردیده"}
                </span>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>جمع کل خرید (مبلغ ناخالص):</span>
                <span className="font-mono font-medium">{formatPersianCurrency(calculatedSubtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between items-center text-rose-600">
                  <span>مجموع تخفیف‌ها:</span>
                  <span className="font-mono font-medium">-{formatPersianCurrency(totalDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-gray-600">
                <span>هزینه بسته‌بندی و ارسال پستی:</span>
                <span className="font-mono font-medium">
                  {shippingFee > 0 ? formatPersianCurrency(shippingFee) : "رایگان"}
                </span>
              </div>

              <div className="pt-2 border-t-2 border-gray-300 flex justify-between items-center text-sm font-black text-blue-900">
                <span>مبلغ قابل پرداخت نهایی:</span>
                <span className="font-mono text-base text-blue-700">
                  {formatPersianCurrency(finalPayable)}
                </span>
              </div>

              <div className="text-[11px] text-gray-500 text-left pt-1">
                وضعیت تسویه:{" "}
                <span className="font-bold text-gray-800">
                  {paymentAmount > 0 ? "تسویه از طریق درگاه الکترونیک" : "پرداخت در محل / در انتظار واریز"}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
