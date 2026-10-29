import React from "react";
import prisma from "@backend/modules/prisma/Prisma";
import { getVar } from "@backend/utils/setting";
import { CategorySelectionView } from "./CategorySelectionView";
import { ssrOptimize } from "@/utils/other";

export const metadata = {
  title: "دسته‌بندی‌های محصولات طِب خیّر - عسل، حلوا سیاه و گیاهان دارویی",
  description: "انتخاب دسته‌بندی و خرید مستقیم محصولات طبیعی، دارویی و سوغات ناب اردبیل با امکان ارسال رایگان",
};

interface PageProps {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

export default async function CategoryPage(props: PageProps) {
  const resolvedSearchParams = props.searchParams
    ? await Promise.resolve(props.searchParams)
    : {};
  const productId = typeof resolvedSearchParams.productId === "string" ? resolvedSearchParams.productId : undefined;

  const [categories, complementaryProducts, freeShippingThreshold, recentlyAddedProduct] = await Promise.all([
    prisma.productCategory.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    }),
    prisma.product.findMany({
      where: {
        stock: { gt: 0 },
        ...(productId ? { id: { not: productId } } : {}),
      },
      include: {
        category: true,
      },
      take: 8,
      orderBy: [
        { isBestSeller: "desc" },
        { isSpecial: "desc" },
        { created_at: "desc" },
      ],
    }),
    getVar<string>("FREE_SHIPPING_THRESHOLD", "2000000"),
    productId
      ? prisma.product.findUnique({
          where: { id: productId },
          include: { category: true },
        })
      : null,
  ]);

  return (
    <CategorySelectionView
      categories={ssrOptimize(categories)}
      complementaryProducts={ssrOptimize(complementaryProducts)}
      freeShippingThreshold={Number(freeShippingThreshold) || 2000000}
      recentlyAddedProduct={recentlyAddedProduct ? ssrOptimize(recentlyAddedProduct) : null}
    />
  );
}
