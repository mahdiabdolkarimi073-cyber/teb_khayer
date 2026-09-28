import prisma from "@backend/modules/prisma/Prisma";
import { getVar } from "@backend/utils/setting";
import DigikalaService, { DigikalaProduct } from "@backend/modules/digikala/DigikalaService";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";

export interface DigikalaSyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: number;
  errorMessages: string[];
}

export class DigikalaSync {
  static async syncPricesToDigikala(): Promise<DigikalaSyncResult> {
    const enabled = await getVar<string>("DIGIKALA_ENABLED");
    if (enabled !== "true") {
      return { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: ["دیجی‌کالا غیرفعال است"] };
    }

    const result: DigikalaSyncResult = { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: [] };

    const products = await prisma.product.findMany();

    const digikalaProducts = await this.fetchExistingProducts();
    const nameMap = new Map<string, DigikalaProduct>();
    for (const dp of digikalaProducts) {
      if (dp.title_fa) nameMap.set(dp.title_fa, dp);
    }

    for (const product of products) {
      try {
        const existing = nameMap.get(product.name);
        if (!existing?.id && !existing?.product_id) {
          result.errors++;
          result.errorMessages.push(`${product.name}: محصول در دیجی‌کالا یافت نشد`);
          continue;
        }

        const digikalaId = existing.id || existing.product_id!;
        await DigikalaService.updateProductPrice(digikalaId, Math.round(product.price), existing.variant_id);
        result.updated++;
        result.synced++;
      } catch (e) {
        result.errors++;
        result.errorMessages.push(`${product.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return result;
  }

  static async syncInventoryToDigikala(): Promise<DigikalaSyncResult> {
    const enabled = await getVar<string>("DIGIKALA_ENABLED");
    if (enabled !== "true") {
      return { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: ["دیجی‌کالا غیرفعال است"] };
    }

    const result: DigikalaSyncResult = { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: [] };

    const products = await prisma.product.findMany();

    const digikalaProducts = await this.fetchExistingProducts();
    const nameMap = new Map<string, DigikalaProduct>();
    for (const dp of digikalaProducts) {
      if (dp.title_fa) nameMap.set(dp.title_fa, dp);
    }

    for (const product of products) {
      try {
        const existing = nameMap.get(product.name);
        if (!existing?.id && !existing?.product_id) {
          result.errors++;
          result.errorMessages.push(`${product.name}: محصول در دیجی‌کالا یافت نشد`);
          continue;
        }

        const digikalaId = existing.id || existing.product_id!;
        await DigikalaService.updateProductInventory(digikalaId, product.stock, existing.variant_id);
        result.synced++;
      } catch (e) {
        result.errors++;
        result.errorMessages.push(`${product.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return result;
  }

  static async syncOrdersFromDigikala(): Promise<DigikalaSyncResult> {
    const enabled = await getVar<string>("DIGIKALA_ENABLED");
    if (enabled !== "true") {
      return { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: ["دیجی‌کالا غیرفعال است"] };
    }

    const result: DigikalaSyncResult = { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: [] };

    try {
      const orders = await DigikalaService.getOrders();

      for (const order of orders.data || []) {
        result.synced++;
      }
    } catch (e) {
      result.errors++;
      result.errorMessages.push(e instanceof Error ? e.message : String(e));
    }

    return result;
  }

  private static async fetchExistingProducts(): Promise<DigikalaProduct[]> {
    try {
      const res = await DigikalaService.getProducts(1, 100);
      return res.data || [];
    } catch (e) {
      console.error("[DIGIKALA] fetchExistingProducts error:", e);
      return [];
    }
  }
}

export default DigikalaSync;
