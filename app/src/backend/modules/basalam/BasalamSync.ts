import prisma from "@backend/modules/prisma/Prisma";
import { getVar } from "@backend/utils/setting";
import BasalamService, { BasalamProduct } from "@backend/modules/basalam/BasalamService";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";

export interface SyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: number;
  errorMessages: string[];
}

export class BasalamSync {
  static async syncProductsToBasalam(): Promise<SyncResult> {
    const enabled = await getVar<string>("BASALAM_ENABLED");
    if (enabled !== "true") {
      return { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: ["باسلام غیرفعال است"] };
    }

    const result: SyncResult = { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: [] };

    const products = await prisma.product.findMany({
      include: { category: true },
    });

    const existingBasalamProducts = await this.fetchExistingProducts();

    for (const product of products) {
      try {
        const basalamProduct = this.mapLocalProductToBasalam(product);

        const existing = existingBasalamProducts.find((p) => p.name === product.name);

        if (existing?.id) {
          await BasalamService.updateProduct(existing.id, basalamProduct);
          result.updated++;
        } else {
          await BasalamService.createProduct(basalamProduct);
          result.created++;
        }
        result.synced++;
      } catch (e) {
        result.errors++;
        result.errorMessages.push(`${product.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return result;
  }

  static async syncInventoryToBasalam(productIds?: string[]): Promise<SyncResult> {
    const enabled = await getVar<string>("BASALAM_ENABLED");
    if (enabled !== "true") {
      return { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: ["باسلام غیرفعال است"] };
    }

    const result: SyncResult = { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: [] };

    const products = await prisma.product.findMany({
      where: productIds ? { id: { in: productIds } } : undefined,
    });

    const existingBasalamProducts = await this.fetchExistingProducts();

    for (const product of products) {
      try {
        const existing = existingBasalamProducts.find((p) => p.name === product.name);
        if (!existing?.id) {
          result.errors++;
          result.errorMessages.push(`${product.name}: محصول در باسلام یافت نشد`);
          continue;
        }

        await BasalamService.updateInventory(existing.id, product.stock);
        result.synced++;
      } catch (e) {
        result.errors++;
        result.errorMessages.push(`${product.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return result;
  }

  static async syncOrdersFromBasalam(): Promise<SyncResult> {
    const enabled = await getVar<string>("BASALAM_ENABLED");
    if (enabled !== "true") {
      return { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: ["باسلام غیرفعال است"] };
    }

    const result: SyncResult = { synced: 0, created: 0, updated: 0, errors: 0, errorMessages: [] };

    try {
      const orders = await BasalamService.getOrders();

      for (const order of orders.data || []) {
        result.synced++;
      }
    } catch (e) {
      result.errors++;
      result.errorMessages.push(e instanceof Error ? e.message : String(e));
    }

    return result;
  }

  private static async fetchExistingProducts(): Promise<BasalamProduct[]> {
    try {
      const res = await BasalamService.getProducts(1, 100);
      return res.data || [];
    } catch (e) {
      console.error("[BASALAM] fetchExistingProducts error:", e);
      return [];
    }
  }

  private static mapLocalProductToBasalam(product: any): Partial<BasalamProduct> {
    const baseUrl = SettingKeyInfo["TRUST_WEBSITE"]?.default as string || "https://teb-khayyer.ir";

    return {
      name: product.name,
      price: Math.round(product.price),
      old_price: product.originalPrice ? Math.round(product.originalPrice) : undefined,
      inventory: product.stock,
      description: product.description_text || product.description || "",
      status: "published",
    };
  }
}

export default BasalamSync;
