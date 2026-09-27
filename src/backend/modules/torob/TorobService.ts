import { getVar, setVar } from "@backend/utils/setting";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";
import prisma from "@backend/modules/prisma/Prisma";

export interface TorobFeedProduct {
  product_id: string;
  title: string;
  price: number;
  old_price: number | null;
  url: string;
  availability: "in stock" | "out of stock";
  image: string | null;
  category: string;
  description: string;
  brand: string | null;
  sku: string | null;
}

export interface TorobFeed {
  products: TorobFeedProduct[];
}

export interface TorobConfig {
  enabled: boolean;
  shopName: string;
  feedUrl: string;
  torobLink: string;
}

export interface TorobStatus {
  configured: boolean;
  enabled: boolean;
  hasFeed: boolean;
  hasShop: boolean;
  productCount: number;
}

export interface TorobSyncResult {
  total: number;
  inStock: number;
  outOfStock: number;
  errors: number;
  errorMessages: string[];
}

export class TorobService {
  static async getCredentials() {
    const [enabled, shopName, torobLink] = await Promise.all([
      getVar<string>("TOROB_ENABLED"),
      getVar<string>("TOROB_SHOP_NAME"),
      getVar<string>("TOROB_LINK"),
    ]);

    return {
      enabled: enabled === "true",
      shopName,
      torobLink,
    };
  }

  static async isConfigured(): Promise<boolean> {
    const enabled = await getVar<string>("TOROB_ENABLED");
    return enabled === "true";
  }

  static async getFeedUrl(): Promise<string> {
    const baseUrl =
      (await getVar<string>("TRUST_WEBSITE")) ||
      (SettingKeyInfo["TRUST_WEBSITE"]?.default as string) ||
      "https://teb-khayyer.ir";
    return `${baseUrl}/api/torob/feed`;
  }

  static async generateFeed(): Promise<TorobFeed> {
    const baseUrl =
      (await getVar<string>("TRUST_WEBSITE")) ||
      (SettingKeyInfo["TRUST_WEBSITE"]?.default as string) ||
      "https://teb-khayyer.ir";

    const products = await prisma.product.findMany({
      include: { category: true },
    });

    const feedProducts: TorobFeedProduct[] = products.map((p) => ({
      product_id: p.id,
      title: p.name,
      price: Math.round(p.price),
      old_price: p.originalPrice ? Math.round(p.originalPrice) : null,
      url: `${baseUrl}/product/${p.id}`,
      availability: p.stock > 0 ? "in stock" : "out of stock",
      image: p.images?.[0] ? `${baseUrl}${p.images[0]}` : null,
      category: p.category?.name || "",
      description: p.description_text || p.description || "",
      brand: null,
      sku: p.id,
    }));

    return { products: feedProducts };
  }

  static async testFeed(): Promise<TorobSyncResult> {
    const result: TorobSyncResult = {
      total: 0,
      inStock: 0,
      outOfStock: 0,
      errors: 0,
      errorMessages: [],
    };

    try {
      const feed = await this.generateFeed();
      result.total = feed.products.length;
      result.inStock = feed.products.filter((p) => p.availability === "in stock").length;
      result.outOfStock = feed.products.filter((p) => p.availability === "out of stock").length;

      for (const p of feed.products) {
        if (!p.title) {
          result.errors++;
          result.errorMessages.push(`محصول ${p.product_id}: عنوان خالی است`);
        }
        if (p.price <= 0) {
          result.errors++;
          result.errorMessages.push(`محصول ${p.product_id}: قیمت نامعتبر`);
        }
        if (!p.url) {
          result.errors++;
          result.errorMessages.push(`محصول ${p.product_id}: URL خالی است`);
        }
      }
    } catch (e) {
      result.errors++;
      result.errorMessages.push(e instanceof Error ? e.message : String(e));
    }

    return result;
  }

  static async getStatus(): Promise<TorobStatus> {
    const creds = await this.getCredentials();
    const productCount = await prisma.product.count();

    return {
      configured: await this.isConfigured(),
      enabled: creds.enabled,
      hasFeed: true,
      hasShop: !!creds.shopName,
      productCount,
    };
  }
}

export default TorobService;
