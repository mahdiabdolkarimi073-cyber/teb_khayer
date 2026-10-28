"use client";

import React, { useRef, useState } from "react";
import { IconPrinter, IconSettings, IconArrowRight, IconScissors, IconPackage } from "@tabler/icons-react";
import { Button } from "@mantine/core";
import { PostalBarcode } from "./PostalBarcode";
import { SenderInfoType, updateSenderSettings } from "@/app/(web)/admin/orders/order.action";
import { modal } from "@/utils/modal";
import { SenderSettingsModal } from "./SenderSettingsModal";
import { toPersianDate, formatPersianNumber, formatPersianCurrency } from "@/utils/format";

export interface PostalLabelProps {
  order: {
    id: number;
    createdAt: Date | string;
    status?: string;
    paymentAmount?: number;
    shippingFee?: number;
    isFreeShipping?: boolean;
    trackingCode?: string | null;
    shippingCompany?: string;
    items?: Array<{ id: string; name: string; count: number; price?: number }>;
    itemCount?: number;
  };
  recipient: {
    name: string;
    phone: string;
    state?: string;
    city?: string;
    address: string;
    zipcode: string;
    fullAddress?: string;
  };
  sender: SenderInfoType;
  showToolbar?: boolean;
}

export function PostalLabel({
  order,
  recipient,
  sender: initialSender,
  showToolbar = true,
}: PostalLabelProps) {
  const [sender, setSender] = useState<SenderInfoType>(initialSender);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleEditSender = () => {
    modal(
      "تنظیمات اطلاعات فرستنده (برچسب پستی)",
      <SenderSettingsModal
        currentSettings={sender}
        onSaved={(updated) => setSender(updated)}
      />
    );
  };

  const barcodeValue = order.trackingCode?.trim() || String(order.id);
  const formattedDate = toPersianDate(order.createdAt);
  const fullRecipientAddress = recipient.fullAddress || 
    [recipient.state, recipient.city, recipient.address].filter(Boolean).join("، ");

  return (
    <div className="postal-label-wrapper w-full flex flex-col items-center">
      {/* Screen Toolbar (hidden in print) */}
      {showToolbar && (
        <div className="print:hidden w-full max-w-[210mm] mb-4 p-3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-sm">برچسب پستی سفارش #{order.id}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
              سایز استاندارد A5 افقی (210×148mm)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              color="gray"
              leftSection={<IconSettings size={15} />}
              onClick={handleEditSender}
            >
              ویرایش اطلاعات فرستنده
            </Button>
            <Button
              size="xs"
              color="dark"
              leftSection={<IconPrinter size={15} />}
              onClick={handlePrint}
            >
              چاپ یا ذخیره PDF
            </Button>
          </div>
        </div>
      )}

      {/* Print Stylesheet */}
      <style jsx global>{`
        @page {
          size: A5 landscape;
          margin: 0;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 148mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .postal-label-sheet, .postal-label-sheet * {
            visibility: visible;
          }
          .postal-label-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 148mm !important;
            margin: 0 !important;
            padding: 4mm 6mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* A5 Landscape Container (210mm x 148mm) */}
      <div
        ref={printAreaRef}
        dir="rtl"
        className="postal-label-sheet bg-white text-black font-sans box-border shadow-md border border-gray-300 print:shadow-none print:border-none"
        style={{
          width: "210mm",
          height: "148mm",
          maxHeight: "148mm",
          padding: "4mm 6mm",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ================= TOP HALF (Max 72mm height) ================= */}
        <div
          className="flex flex-col justify-between"
          style={{ height: "69mm", boxSizing: "border-box" }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-1.5">
            {/* Store & Label Title */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded border border-black flex items-center justify-center font-black text-sm bg-black text-white">
                طِب
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight leading-none text-black">
                  {sender.name || "فروشگاه آنلاین طِب خیّر"}
                </h1>
                <p className="text-[10px] text-gray-700 font-semibold mt-0.5">
                  برچسب نشانی مرسوله پستی ({order.shippingCompany || "پست پیشتاز"})
                </p>
              </div>
            </div>

            {/* Order & Date Details */}
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-[10px] text-gray-600 block">تاریخ سفارش:</span>
                <span className="font-bold font-mono text-[11px] text-black">{formattedDate}</span>
              </div>
              <div className="border border-black rounded px-2 py-0.5 bg-black text-white text-center">
                <span className="text-[9px] block leading-none">شماره سفارش</span>
                <span className="font-black font-mono text-xs tracking-wider">#{order.id}</span>
              </div>
            </div>
          </div>

          {/* Sender & Recipient Main Grid */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {/* RIGHT BOX: SENDER */}
            <div className="border border-black rounded p-1.5 flex flex-col justify-between text-[11px] leading-snug">
              <div>
                <div className="flex items-center justify-between border-b border-black/40 pb-0.5 mb-1">
                  <span className="font-black text-[11px] bg-black text-white px-1.5 py-0.2 rounded-xs">
                    فرستنده
                  </span>
                  <span className="text-[10px] font-mono text-gray-700">تلفن: {sender.phone}</span>
                </div>
                <div className="font-bold text-gray-900 text-[11.5px] mb-0.5">
                  {sender.name}
                </div>
                <div className="text-gray-800 text-[10.5px] leading-tight line-clamp-2">
                  <span className="font-semibold text-gray-900">نشانی: </span>
                  {sender.address}
                </div>
              </div>

              <div className="mt-1 pt-1 border-t border-dashed border-gray-400 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-900">کد پستی فرستنده:</span>
                <span className="font-mono font-black text-xs tracking-widest bg-gray-100 px-2 py-0.5 border border-gray-400 rounded">
                  {sender.zipcode || "-"}
                </span>
              </div>
            </div>

            {/* LEFT BOX: RECIPIENT */}
            <div className="border-2 border-black rounded p-1.5 flex flex-col justify-between text-[11px] leading-snug bg-gray-50/40">
              <div>
                <div className="flex items-center justify-between border-b border-black pb-0.5 mb-1">
                  <span className="font-black text-[11px] bg-black text-white px-2 py-0.2 rounded-xs">
                    گیرنده
                  </span>
                  <span className="text-xs font-mono font-black text-black dir-ltr">
                    تلفن: {recipient.phone}
                  </span>
                </div>
                <div className="font-black text-black text-xs mb-0.5">
                  {recipient.name}
                </div>
                <div className="text-black text-[11px] font-semibold leading-tight line-clamp-2">
                  <span className="font-bold text-gray-900">نشانی: </span>
                  {fullRecipientAddress}
                </div>
              </div>

              <div className="mt-1 pt-1 border-t border-black flex items-center justify-between bg-white px-1 rounded">
                <span className="text-[11px] font-black text-black">کد پستی گیرنده:</span>
                <span className="font-mono font-black text-sm tracking-widest text-black px-2 py-0.5 border-2 border-black rounded">
                  {recipient.zipcode || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Bar: Barcode, Item Summary & Shipping Notice */}
          <div className="mt-1 pt-1 border-t border-black flex items-center justify-between gap-2">
            {/* Barcode section */}
            <div className="flex items-center gap-2">
              <PostalBarcode value={barcodeValue} height={28} barWidth={1.3} showText={true} />
            </div>

            {/* Package contents summary */}
            <div className="flex-1 text-right text-[10px] text-gray-800 pr-2 border-r border-gray-300">
              <div className="flex items-center gap-1 font-bold">
                <IconPackage size={12} className="inline text-black" />
                <span>محتویات مرسوله ({order.itemCount || order.items?.length || 1} قلم):</span>
              </div>
              <div className="text-[9.5px] text-gray-600 line-clamp-1 truncate max-w-[280px]">
                {order.items?.map((it) => `${it.name} (${it.count} عدد)`).join("، ") || "محصولات دارویی و گیاهی طِب خیّر"}
              </div>
            </div>

            {/* Postal Stamps & Badge */}
            <div className="flex flex-col items-end text-left pl-1">
              <span className="border border-black px-1.5 py-0.5 text-[9px] font-black rounded uppercase">
                {order.isFreeShipping ? "ارسال رایگان" : "کرایه پرداخت‌شده"}
              </span>
              <span className="text-[9px] font-mono text-gray-500 mt-0.5">
                teb-khayyer.ir
              </span>
            </div>
          </div>
        </div>

        {/* ================= MIDDLE CUTTING LINE (Exactly at 74mm) ================= */}
        <div
          className="w-full flex items-center justify-center my-1 select-none text-gray-500 text-[10px]"
          style={{ height: "4mm" }}
        >
          <div className="flex-1 border-b border-dashed border-gray-500" />
          <div className="px-3 flex items-center gap-1 font-mono text-[9px] text-gray-600">
            <IconScissors size={12} />
            <span>محل برش کاغذ A5 (نیمه پایینی برگه را برش دهید)</span>
            <IconScissors size={12} className="transform -scale-x-100" />
          </div>
          <div className="flex-1 border-b border-dashed border-gray-500" />
        </div>

        {/* ================= BOTTOM HALF (Blank for cutting) ================= */}
        <div
          className="w-full flex items-center justify-center text-gray-300 text-xs select-none"
          style={{ height: "66mm" }}
        >
          <span className="print:hidden border border-dashed border-gray-200 p-4 rounded-xl text-center text-gray-400">
            [ نیمه پایینی کاغذ A5 جهت برش - خالی در پرینت نهایی ]
          </span>
        </div>
      </div>
    </div>
  );
}
