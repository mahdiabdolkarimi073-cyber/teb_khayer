import { OrderStatus } from "@prisma/client";

export const CANCELLATION_REASONS = [
  "تغییر نظر مشتری",
  "تأخیر در ارسال",
  "ناموجودشدن کالا",
  "مشکل پرداخت",
  "ثبت اشتباه سفارش",
  "سایر موارد",
] as const;

export type CancellationReasonType = (typeof CANCELLATION_REASONS)[number];

export type SenderInfoType = {
  name: string;
  phone: string;
  address: string;
  zipcode: string;
};

export type OrderLabelItem = {
  id: string;
  name: string;
  count: number;
  price: number;
};

export type OrderLabelOrder = {
  id: number;
  createdAt: Date | string;
  status: OrderStatus;
  paymentAmount: number;
  shippingFee: number;
  isFreeShipping: boolean;
  trackingCode: string | null;
  shippingCompany: string;
  items: OrderLabelItem[];
  itemCount: number;
};

export type OrderLabelRecipient = {
  name: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  zipcode: string;
  fullAddress: string;
};

export type OrderLabelData = {
  order: OrderLabelOrder;
  recipient: OrderLabelRecipient;
  sender: SenderInfoType;
};

export type OrderCancellationRecord = {
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  note: string | null;
  canceledBy: string;
  created_at: string;
};

export type CancellationReportsData = {
  byReason: Array<{ reason: string; count: number }>;
  recent: Array<{
    id: number;
    orderId: number;
    userId: number;
    reason: string;
    note: string | null;
    canceledBy: string;
    created_at: string;
    userName?: string;
    userPhone?: number;
  }>;
};
