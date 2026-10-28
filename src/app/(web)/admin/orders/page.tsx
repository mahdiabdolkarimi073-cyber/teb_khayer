"use client";

import {
  changeOrderStatus,
  cancelOrderWithReason,
  updateOrderTrackingCode,
  getAllOrders,
  getOrdersCount,
  getSenderSettings,
  CANCELLATION_REASONS,
} from "@/app/(web)/admin/orders/order.action";
import {
  ActionIcon,
  Badge,
  Button,
  NumberInput,
  Pagination,
  ScrollArea,
  Select,
  Table,
  TextInput,
  Textarea,
} from "@mantine/core";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import React, { useState } from "react";
import { useAction } from "@/utils/server";
import Loading from "@/app/(app)/loading";
import Link from "next/link";
import {
  IconExchange,
  IconBarcode,
  IconAlertTriangle,
  IconUser,
  IconExternalLink,
  IconPrinter,
  IconSettings,
} from "@tabler/icons-react";
import { closeLastModal, modal } from "@/utils/modal";
import { OrderStatus } from "@prisma/client";
import { CheckoutFields } from "@/app/(web)/dashboard/checkout/checkout.fields";
import { formatPersianCurrency, toPersianDateTime, formatPersianNumber } from "@/utils/format";
import { SenderSettingsModal } from "@/components/admin/SenderSettingsModal";

const AdminOrderView = () => {
  const [skip, setSkip] = useState(0);
  const [phone, setPhone] = useState<number | undefined>();
  const [status, setStatus] = useState<OrderStatus>();
  const { result: orders, isPending, refetch } = useAction(getAllOrders, skip, status, phone);
  const { result: count, isPending: isP1 } = useAction(getOrdersCount, status, phone);

  // Status Change Dialog Handler
  const openStatusChangeModal = (order: any) => {
    modal(
      `مدیریت سفارش #${order.id} - ${order.user?.name || "کاربر"}`,
      <StatusModalContent order={order} onUpdated={refetch} />,
      { size: "lg" }
    );
  };

  const openSenderSettingsModal = async () => {
    const current = await getSenderSettings();
    modal("تنظیمات اطلاعات فرستنده (برچسب پستی)", <SenderSettingsModal currentSettings={current} />);
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[160px] flex-1">
          <Select
            label="فیلتر وضعیت سفارش"
            value={status}
            onChange={(e) => setStatus(e as OrderStatus)}
            clearable
            placeholder="همه وضعیت‌ها"
            data={Object.entries(OrderStatusEnum).map(([key, name]) => ({
              label: name,
              value: key,
            }))}
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <NumberInput
            label="جستجو با شماره همراه"
            placeholder="مثال: 09121234567"
            onChange={(e) => {
              if ((e + "").length >= 9) setPhone(+e);
              else if (!e) setPhone(undefined);
            }}
          />
        </div>
        <div>
          <Button
            size="sm"
            variant="outline"
            color="gray"
            leftSection={<IconSettings size={16} />}
            onClick={openSenderSettingsModal}
          >
            تنظیمات فرستنده پستی
          </Button>
        </div>
      </div>

      {isPending || isP1 ? (
        <Loading />
      ) : (
        <>
          <ScrollArea className="border rounded-2xl shadow-2xs bg-white">
            <Table miw={850} striped highlightOnHover verticalSpacing="sm">
              <Table.Thead className="bg-gray-50">
                <Table.Tr>
                  <Table.Th className="text-right">شماره سفارش (ID)</Table.Th>
                  <Table.Th className="text-right">مشتری</Table.Th>
                  <Table.Th className="text-right">مبلغ پرداختی</Table.Th>
                  <Table.Th className="text-right">تاریخ ثبت</Table.Th>
                  <Table.Th className="text-right">وضعیت و کد رهگیری</Table.Th>
                  <Table.Th className="text-right">اقلام</Table.Th>
                  <Table.Th className="text-center">عملیات</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orders?.map?.((order) => {
                  let rawInfo: any = {};
                  try {
                    rawInfo = typeof order.info === "string" ? JSON.parse(order.info) : (order.info || {});
                  } catch {
                    rawInfo = {};
                  }

                  const trackingCode = rawInfo?.trackingCode || rawInfo?.postalCode;
                  const cancellationReason = rawInfo?.cancellationReason;

                  return (
                    <Table.Tr key={order.id + order.status}>
                      <Table.Td className="font-bold text-gray-900 font-mono">
                        #{formatPersianNumber(order.id)}
                      </Table.Td>

                      <Table.Td>
                        <div className="flex flex-col text-xs">
                          <span className="font-bold text-gray-900">{order.user?.name || "بی‌نام"}</span>
                          <span className="font-mono text-gray-500 dir-ltr">{order.user?.phone ? `0${order.user.phone}` : "-"}</span>
                        </div>
                      </Table.Td>

                      <Table.Td className="font-bold text-blue-700 text-xs sm:text-sm">
                        {formatPersianCurrency(+order.payment.amount)}
                      </Table.Td>

                      <Table.Td className="text-xs text-gray-500 font-mono">
                        {toPersianDateTime(order.created_at)}
                      </Table.Td>

                      <Table.Td>
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              order.status === "CANCELED"
                                ? "bg-red-100 text-red-800"
                                : order.status === "DELAY"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "SENDED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {OrderStatusEnum[order.status]}
                          </span>

                          {/* Cancellation reason badge */}
                          {order.status === "CANCELED" && cancellationReason && (
                            <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-bold">
                              علت لغو: {cancellationReason}
                            </span>
                          )}

                          {/* Postal Tracking code badge */}
                          {trackingCode && (
                            <span className="text-[11px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                              کد رهگیری: {trackingCode}
                            </span>
                          )}
                        </div>
                      </Table.Td>

                      <Table.Td className="text-xs">
                        <div className="flex flex-col gap-1">
                          {order.products.map((op) => (
                            <div key={op.product.id} className="flex items-center gap-2">
                              <Link
                                href={`/product/${op.product.id}`}
                                className="text-blue-600 hover:underline max-w-[180px] truncate"
                              >
                                {op.product.name}
                              </Link>
                              <Badge size="xs" variant="light">
                                {op.count} عدد
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Table.Td>

                      <Table.Td className="text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <Button
                            size="xs"
                            variant="light"
                            color="blue"
                            leftSection={<IconExchange size={14} />}
                            onClick={() => openStatusChangeModal(order)}
                          >
                            تغییر وضعیت
                          </Button>
                          <Link
                            href={`/admin/orders/${order.id}/label`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="xs"
                              variant="filled"
                              color="dark"
                              leftSection={<IconPrinter size={14} />}
                              title="چاپ برچسب پستی افقی A5"
                            >
                              چاپ برچسب پستی
                            </Button>
                          </Link>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          <div className="flex justify-center mt-3">
            <Pagination
              total={Math.ceil((count || 0) / 10)}
              value={Math.max(Math.floor(skip / 10) + 1, 1)}
              onChange={(page) => setSkip((page - 1) * 10)}
            />
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Enhanced Modal Content for Changing Status,
 * With Full Order Cancellation Reason Management & Postal Tracking Code Registration
 */
function StatusModalContent({ order, onUpdated }: { order: any; onUpdated: () => void }) {
  const [activeStep, setActiveStep] = useState<"select_status" | "cancel_reason" | "shipping_code">(
    "select_status"
  );
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [cancellationNote, setCancellationNote] = useState<string>("");
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [shippingCompany, setShippingCompany] = useState<string>("پست پیشتاز");
  const [loading, setLoading] = useState(false);

  let rawInfo: any = {};
  try {
    rawInfo = typeof order.info === "string" ? JSON.parse(order.info) : (order.info || {});
  } catch {
    rawInfo = {};
  }

  const handleStatusSelect = (statusKey: OrderStatus) => {
    if (statusKey === OrderStatus.CANCELED) {
      setActiveStep("cancel_reason");
    } else if (statusKey === OrderStatus.SENDED) {
      setActiveStep("shipping_code");
    } else {
      setLoading(true);
      changeOrderStatus(order.id, statusKey)
        .then(() => {
          onUpdated();
          closeLastModal();
        })
        .finally(() => setLoading(false));
    }
  };

  const handleConfirmCancellation = async () => {
    setLoading(true);
    try {
      const res = await cancelOrderWithReason(order.id, selectedReason, cancellationNote);
      if (res.success) {
        onUpdated();
        closeLastModal();
      } else {
        alert(res.message);
      }
    } catch {
      alert("خطا در لغو سفارش");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmShipping = async () => {
    if (!trackingCode.trim()) {
      alert("لطفاً کد رهگیری مرسوله پستی را وارد فرمایید.");
      return;
    }
    setLoading(true);
    try {
      const res = await updateOrderTrackingCode(order.id, trackingCode, shippingCompany);
      if (res.success) {
        onUpdated();
        closeLastModal();
      } else {
        alert(res.message);
      }
    } catch {
      alert("خطا در ثبت کد رهگیری");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs sm:text-sm" dir="rtl">
      {/* Order Summary Box */}
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-bold text-gray-800">وضعیت فعلی: </span>
          <span className="text-blue-700 font-black">{OrderStatusEnum[order.status as OrderStatus]}</span>
        </div>
        <div>
          <span className="font-bold text-gray-800">مبلغ سفارش: </span>
          <span className="text-emerald-700 font-bold font-mono">{formatPersianCurrency(+order.payment.amount)}</span>
        </div>
      </div>

      {/* STEP 1: SELECT GENERAL STATUS */}
      {activeStep === "select_status" && (
        <div className="space-y-3">
          <p className="font-bold text-gray-700">وضعیت جدید سفارش را انتخاب نمایید:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(OrderStatusEnum).map(([key, name]) => {
              const isCurrent = order.status === key;
              const isCancel = key === "CANCELED";
              const isSend = key === "SENDED";

              return (
                <Button
                  key={key}
                  disabled={loading || isCurrent}
                  color={isCancel ? "red" : isSend ? "blue" : "gray"}
                  variant={isCurrent ? "filled" : "light"}
                  fullWidth
                  onClick={() => handleStatusSelect(key as OrderStatus)}
                >
                  {name}
                  {isCurrent && " (فعلی)"}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: CANCELLATION REASON FORM */}
      {activeStep === "cancel_reason" && (
        <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 space-y-3">
          <div className="flex items-center gap-2 text-red-800 font-black text-sm">
            <IconAlertTriangle size={18} />
            <span>ثبت علت لغو سفارش #{order.id}</span>
          </div>

          <p className="text-xs text-red-700">
            لطفاً علت لغو سفارش را مشخص کنید تا در سوابق مشتری و گزارش‌های مدیریتی ثبت شود:
          </p>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-xs">دسته‌بندی علت لغو:</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-red-300 text-xs sm:text-sm focus:ring-2 focus:ring-red-500 bg-white"
            >
              {CANCELLATION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-xs">توضیح تکمیلی مدیریت (اختیاری):</label>
            <textarea
              rows={2}
              value={cancellationNote}
              onChange={(e) => setCancellationNote(e.target.value)}
              placeholder="مثال: مشتری تماس گرفت و تقاضای تغییر آدرس یا عودت وجه نمود..."
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-red-500 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => setActiveStep("select_status")}
              disabled={loading}
            >
              بازگشت
            </Button>
            <Button
              color="red"
              size="xs"
              onClick={handleConfirmCancellation}
              loading={loading}
            >
              تأیید و ثبت نهایی لغو سفارش
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: POSTAL TRACKING REGISTRATION */}
      {activeStep === "shipping_code" && (
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
            <IconBarcode size={18} />
            <span>ثبت کد رهگیری پستی و ارسال سفارش #{order.id}</span>
          </div>

          <p className="text-xs text-blue-700">
            با ثبت این کد، سفارش به وضعیت «ارسال شده» تغییر کرده و کد رهگیری به صورت خودکار به مشتری پیامک خواهد شد:
          </p>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-xs">کد رهگیری ۲۴ رقمی پستی یا بارکد تیپاکس:</label>
            <input
              type="text"
              dir="ltr"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="100000000000000000000000"
              className="w-full p-2.5 font-mono rounded-xl border border-blue-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 bg-white text-center"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-xs">شرکت حمل‌ونقل:</label>
            <select
              value={shippingCompany}
              onChange={(e) => setShippingCompany(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-blue-300 text-xs sm:text-sm bg-white"
            >
              <option value="پست پیشتاز">شرکت ملی پست (پیشتاز)</option>
              <option value="تیپاکس">تیپاکس (اکسپرس)</option>
              <option value="پیک موتوری">پیک اختصاصی شهری</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => setActiveStep("select_status")}
              disabled={loading}
            >
              بازگشت
            </Button>
            <Button
              color="blue"
              size="xs"
              onClick={handleConfirmShipping}
              loading={loading}
            >
              ثبت کد رهگیری و تغییر به ارسال شده
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderView;
