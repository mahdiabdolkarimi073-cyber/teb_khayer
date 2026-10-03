'use server'

import prisma from "@backend/modules/prisma/Prisma";
import type { SortOption } from "@/app/(web)/category/all/action";

export type { SortOption };

const SOUVENIR_MATCH = { contains: "سوغات" };

async function getSouvenirCategoryIds(): Promise<string[]> {
  const cats = await prisma.productCategory.findMany({
    where: {
      OR: [
        { name: SOUVENIR_MATCH },
        { parent: { name: SOUVENIR_MATCH } },
      ],
    },
    select: { id: true },
  });
  const childCats = await prisma.productCategory.findMany({
    where: { parentId: { in: cats.map((c) => c.id) } },
    select: { id: true },
  });
  return [...cats.map((c) => c.id), ...childCats.map((c) => c.id)];
}

export async function getSouvenirProductCount(
  search: string | undefined = undefined,
  filter?: SortOption
) {
  const categoryIds = await getSouvenirCategoryIds();
  return await prisma.product.count({
    where: {
      categoryId: { in: categoryIds.length ? categoryIds : undefined },
      ...(search && ({
        OR: [
          { name: { contains: search } },
          { description_text: { contains: search } },
        ],
      })),
      ...(filter === "bestSeller" && { isBestSeller: true }),
      ...(filter === "special" && { isSpecial: true }),
      ...(filter === "discount" && { discountPercent: { gt: 0 } }),
    },
  });
}

export async function getSouvenirProducts(
  skip = 0,
  search: string | undefined = undefined,
  take?: number,
  sort?: SortOption
) {
  const categoryIds = await getSouvenirCategoryIds();
  const orderBy: any = (() => {
    switch (sort) {
      case "priceLow": return { price: "asc" as const };
      case "priceHigh": return { price: "desc" as const };
      case "bestSeller": return [{ isBestSeller: "desc" as const }, { created_at: "desc" as const }];
      case "discount": return [{ discountPercent: "desc" as const }, { created_at: "desc" as const }];
      case "special": return [{ isSpecial: "desc" as const }, { created_at: "desc" as const }];
      default: return { created_at: "desc" as const };
    }
  })();

  return await prisma.product.findMany({
    take: take || 10,
    skip,
    where: {
      categoryId: { in: categoryIds.length ? categoryIds : undefined },
      ...(search && ({
        OR: [
          { name: { contains: search } },
          { description_text: { contains: search } },
        ],
      })),
      ...(sort === "bestSeller" && { isBestSeller: true }),
      ...(sort === "special" && { isSpecial: true }),
      ...(sort === "discount" && { discountPercent: { gt: 0 } }),
    },
    orderBy,
  });
}
