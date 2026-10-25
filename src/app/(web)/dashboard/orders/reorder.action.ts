"use server";

import prisma from "@backend/modules/prisma/Prisma";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { ssrOptimize } from "@/utils/other";

export interface ReorderItemResult {
  productId: string;
  name: string;
  image: string;
  requestedCount: number;
  availableCount: number;
  currentPrice: number;
  originalPrice: number;
  isAvailable: boolean;
  priceChanged: boolean;
}

export interface ReorderResponse {
  success: boolean;
  message: string;
  orderId: number;
  items: ReorderItemResult[];
  availableCount: number;
  outOfStockCount: number;
}

export async function reorderPastOrder(orderId: number): Promise<ReorderResponse> {
  const user = await getUserFromCookie();
  if (!user) {
    return {
      success: false,
      message: "لطفاً ابتدا وارد حساب کاربری خود شوید.",
      orderId,
      items: [],
      availableCount: 0,
      outOfStockCount: 0,
    };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: Number(orderId),
      userId: user.id,
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order || !order.products || order.products.length === 0) {
    return {
      success: false,
      message: "سفارش مورد نظر یا محصولات آن یافت نشد.",
      orderId,
      items: [],
      availableCount: 0,
      outOfStockCount: 0,
    };
  }

  // Fetch all current product states directly from database
  const productIds = order.products.map((p) => p.productId);
  const currentProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  const productMap = new Map<string, typeof currentProducts[0]>();
  currentProducts.forEach((p) => productMap.set(p.id, p));

  const items: ReorderItemResult[] = [];
  let availableCount = 0;
  let outOfStockCount = 0;

  for (const op of order.products) {
    const current = productMap.get(op.productId);
    const requestedCount = Number(op.count || 1);

    if (!current) {
      items.push({
        productId: op.productId,
        name: op.product?.name || `محصول ناموجود (${op.productId})`,
        image: "/empty.png",
        requestedCount,
        availableCount: 0,
        currentPrice: 0,
        originalPrice: Number(op.product?.price || 0),
        isAvailable: false,
        priceChanged: false,
      });
      outOfStockCount++;
      continue;
    }

    const isAvailable = current.stock > 0 || current.forceAvailable;
    const availableStock = current.forceAvailable ? requestedCount : Math.min(requestedCount, current.stock);

    const currentPrice = Number(current.price || 0);
    const originalPrice = Number(op.product?.price || currentPrice);
    const priceChanged = currentPrice !== originalPrice;

    if (isAvailable && availableStock > 0) {
      availableCount++;
    } else {
      outOfStockCount++;
    }

    const hasImages = Array.isArray(current.images) && current.images.length > 0;
    const firstImg = hasImages && typeof current.images[0] === "string" ? current.images[0] : "/empty.png";

    items.push({
      productId: current.id,
      name: current.name,
      image: firstImg,
      requestedCount,
      availableCount: availableStock,
      currentPrice,
      originalPrice,
      isAvailable: isAvailable && availableStock > 0,
      priceChanged,
    });
  }

  let message = "بررسی موجودی و قیمت‌های روز انجام شد.";
  if (outOfStockCount > 0 && availableCount > 0) {
    message = `${availableCount} قلم به سبد اضافه شد. متأسفانه ${outOfStockCount} قلم در حال حاضر ناموجود است.`;
  } else if (availableCount === 0) {
    message = "متأسفانه تمامی اقلام این سفارش در حال حاضر ناموجود هستند.";
  } else {
    message = "تمامی محصولات سفارش با قیمت و موجودی روز آماده افزودن به سبد خرید هستند.";
  }

  return ssrOptimize({
    success: availableCount > 0,
    message,
    orderId,
    items,
    availableCount,
    outOfStockCount,
  });
}
