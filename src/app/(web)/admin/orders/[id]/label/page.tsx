import React from "react";
import { notFound } from "next/navigation";
import { getOrderLabelData } from "@/app/(web)/admin/orders/order.action";
import { PostalLabel } from "@/components/admin/PostalLabel";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

export const metadata = {
  title: "چاپ برچسب نشانی مرسوله پستی - طِب خیّر",
};

export default async function OrderLabelPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = Number(params?.id);
  if (!orderId || isNaN(orderId)) {
    notFound();
  }

  const labelData = await getOrderLabelData(orderId);
  if (!labelData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="print:hidden w-full max-w-[210mm] mb-3 flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold"
        >
          <IconArrowRight size={16} />
          <span>بازگشت به لیست سفارشات</span>
        </Link>
      </div>

      <PostalLabel
        order={labelData.order}
        recipient={labelData.recipient}
        sender={labelData.sender}
        showToolbar={true}
      />
    </div>
  );
}
