"use server";

import prisma from "@backend/modules/prisma/Prisma";
import { ensureCRMTables } from "@backend/modules/crm/crmDb";

export type ProductShippingConfig = {
  productId: string;
  shippingFee: number;
  shippingDiscount: number;
  hasCustomShipping: boolean;
  boxFee: number;
  hasCustomBox: boolean;
};

export async function getProductShipping(productId: string): Promise<ProductShippingConfig> {
  if (!productId) {
    return { productId: "", shippingFee: 0, shippingDiscount: 0, hasCustomShipping: false, boxFee: 0, hasCustomBox: false };
  }
  try {
    await ensureCRMTables();
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "productId", "shippingFee", "shippingDiscount", "hasCustomShipping",
              COALESCE("boxFee", 0) as "boxFee",
              COALESCE("hasCustomBox", false) as "hasCustomBox"
       FROM "ProductShippingConfig"
       WHERE "productId" = $1 LIMIT 1`,
      productId
    );
    if (rows && rows.length > 0) {
      return {
        productId: rows[0].productId,
        shippingFee: Number(rows[0].shippingFee || 0),
        shippingDiscount: Number(rows[0].shippingDiscount || 0),
        hasCustomShipping: Boolean(rows[0].hasCustomShipping),
        boxFee: Number(rows[0].boxFee || 0),
        hasCustomBox: Boolean(rows[0].hasCustomBox),
      };
    }
  } catch (error) {
    console.warn("Error getting product shipping config:", error);
  }
  return { productId, shippingFee: 0, shippingDiscount: 0, hasCustomShipping: false, boxFee: 0, hasCustomBox: false };
}

export async function getProductsShipping(productIds: string[]): Promise<Record<string, ProductShippingConfig>> {
  if (!productIds || !productIds.length) return {};
  try {
    await ensureCRMTables();
    const cleanIds = productIds.filter(Boolean);
    if (!cleanIds.length) return {};

    const placeholders = cleanIds.map((_, i) => `$${i + 1}`).join(", ");
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "productId", "shippingFee", "shippingDiscount", "hasCustomShipping",
              COALESCE("boxFee", 0) as "boxFee",
              COALESCE("hasCustomBox", false) as "hasCustomBox"
       FROM "ProductShippingConfig"
       WHERE "productId" IN (${placeholders})`,
      ...cleanIds
    );

    const result: Record<string, ProductShippingConfig> = {};
    for (const id of cleanIds) {
      result[id] = { productId: id, shippingFee: 0, shippingDiscount: 0, hasCustomShipping: false, boxFee: 0, hasCustomBox: false };
    }
    for (const r of rows || []) {
      result[r.productId] = {
        productId: r.productId,
        shippingFee: Number(r.shippingFee || 0),
        shippingDiscount: Number(r.shippingDiscount || 0),
        hasCustomShipping: Boolean(r.hasCustomShipping),
        boxFee: Number(r.boxFee || 0),
        hasCustomBox: Boolean(r.hasCustomBox),
      };
    }
    return result;
  } catch (error) {
    console.warn("Error getting products shipping configs:", error);
    return {};
  }
}

export async function saveProductShipping(
  productId: string,
  data: {
    shippingFee: number;
    shippingDiscount: number;
    hasCustomShipping: boolean;
    boxFee?: number;
    hasCustomBox?: boolean;
  }
) {
  if (!productId) return { success: false, message: "شناسه محصول نامعتبر است" };
  try {
    await ensureCRMTables();
    const fee = Math.max(0, Number(data.shippingFee || 0));
    const discount = Math.max(0, Number(data.shippingDiscount || 0));
    const hasCustom = Boolean(data.hasCustomShipping);
    const boxFee = Math.max(0, Number(data.boxFee || 0));
    const hasCustomBox = Boolean(data.hasCustomBox);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "ProductShippingConfig" ("productId", "shippingFee", "shippingDiscount", "hasCustomShipping", "boxFee", "hasCustomBox", "updated_at")
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT ("productId") DO UPDATE
       SET "shippingFee" = $2, "shippingDiscount" = $3, "hasCustomShipping" = $4, "boxFee" = $5, "hasCustomBox" = $6, "updated_at" = now()`,
      productId,
      fee,
      discount,
      hasCustom,
      boxFee,
      hasCustomBox
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving product shipping config:", error);
    try {
      const fee = Math.max(0, Number(data.shippingFee || 0));
      const discount = Math.max(0, Number(data.shippingDiscount || 0));
      const hasCustom = Boolean(data.hasCustomShipping);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ProductShippingConfig" ("productId", "shippingFee", "shippingDiscount", "hasCustomShipping", "updated_at")
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT ("productId") DO UPDATE
         SET "shippingFee" = $2, "shippingDiscount" = $3, "hasCustomShipping" = $4, "updated_at" = now()`,
        productId,
        fee,
        discount,
        hasCustom
      );
      return { success: true };
    } catch {
      return { success: false, message: "خطا در ذخیره هزینه ارسال محصول" };
    }
  }
}
