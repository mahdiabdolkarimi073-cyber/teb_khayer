import { getVar } from "@backend/utils/setting";
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
  validProductCount: number;
  excludedCount: number;
}

export interface TorobSyncResult {
  total: number;
  inStock: number;
  outOfStock: number;
  errors: number;
  excluded: number;
  errorMessages: string[];
}

export interface TorobFeedPreview {
  feedUrl: string;
  totalProducts: number;
  includedProducts: number;
  excludedProducts: number;
  sample: TorobFeedProduct[];
  errors: string[];
}

function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return (
    (SettingKeyInfo["TRUST_WEBSITE"]?.default as string) ||
    "https://teb-khayyer.ir"
  );
}

function resolveAbsoluteUrl(path: string | null | undefined, baseUrl: string): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path.startsWith("/")) path = "/" + path;
  return `${baseUrl}${path}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDescription(text: string, html: string): string {
  const plain = text && text.trim().length > 0 ? text : stripHtml(html);
  if (!plain) return "";
  return plain.substring(0, 5000);
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
      getBaseUrl();
    return `${baseUrl.replace(/\/+$/, "")}/api/torob/feed`;
  }

  static async generateFeed(): Promise<TorobFeed> {
    const baseUrl = (await getVar<string>("TRUST_WEBSITE")) || getBaseUrl();
    const cleanBase = baseUrl.replace(/\/+$/, "");

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { created_at: "desc" },
    });

    const feedProducts: TorobFeedProduct[] = [];

    for (const p of products) {
      const title = (p.name || "").trim();
      const price = Math.round(p.price || 0);
      const stock = p.stock ?? 0;

      const description = cleanDescription(
        p.description_text || "",
        p.description || ""
      );

      const imageUrl = resolveAbsoluteUrl(
        p.images?.[0] || null,
        cleanBase
      );

      const url = `${cleanBase}/product/${p.id}`;

      const oldPrice =
        p.originalPrice && p.originalPrice > price
          ? Math.round(p.originalPrice)
          : null;

      feedProducts.push({
        product_id: p.id,
        title,
        price,
        old_price: oldPrice,
        url,
        availability: stock > 0 ? "in stock" : "out of stock",
        image: imageUrl,
        category: p.category?.name || "",
        description,
        brand: null,
        sku: p.id,
      });
    }

    return { products: feedProducts };
  }

  static async testFeed(): Promise<TorobSyncResult> {
    const result: TorobSyncResult = {
      total: 0,
      inStock: 0,
      outOfStock: 0,
      errors: 0,
      excluded: 0,
      errorMessages: [],
    };

    try {
      const feed = await this.generateFeed();
      result.total = feed.products.length;
      result.inStock = feed.products.filter(
        (p) => p.availability === "in stock"
      ).length;
      result.outOfStock = feed.products.filter(
        (p) => p.availability === "out of stock"
      ).length;

      const seenIds = new Set<string>();

      for (const p of feed.products) {
        if (!p.title) {
          result.errors++;
          result.errorMessages.push(
            `محصول ${p.product_id}: عنوان خالی است — از فید حذف شد`
          );
        }
        if (p.price <= 0) {
          result.errors++;
          result.errorMessages.push(
            `محصول ${p.product_id}: قیمت نامعتبر (صفر یا منفی) — از فید حذف شد`
          );
        }
        if (!p.url) {
          result.errors++;
          result.errorMessages.push(
            `محصول ${p.product_id}: URL خالی است`
          );
        }
        if (!p.image) {
          result.excluded++;
          result.errorMessages.push(
            `محصول ${p.product_id} (${p.title || "بی‌نام"}): تصویر ندارد`
          );
        }
        if (seenIds.has(p.product_id)) {
          result.errors++;
          result.errorMessages.push(
            `شناسه محصول تکراری: ${p.product_id}`
          );
        }
        seenIds.add(p.product_id);
      }
    } catch (e) {
      result.errors++;
      result.errorMessages.push(
        e instanceof Error ? e.message : String(e)
      );
    }

    return result;
  }

  static async getFeedPreview(sampleSize: number = 5): Promise<TorobFeedPreview> {
    const feed = await this.generateFeed();
    const feedUrl = await this.getFeedUrl();
    const testResult = await this.testFeed();

    const validProducts = feed.products.filter(
      (p) => p.title && p.price > 0
    );

    return {
      feedUrl,
      totalProducts: feed.products.length,
      includedProducts: validProducts.length,
      excludedProducts: feed.products.length - validProducts.length,
      sample: validProducts.slice(0, sampleSize),
      errors: testResult.errorMessages.slice(0, 20),
    };
  }

  static async getStatus(): Promise<TorobStatus> {
    const creds = await this.getCredentials();
    const productCount = await prisma.product.count();

    let validProductCount = 0;
    try {
      const feed = await this.generateFeed();
      validProductCount = feed.products.filter(
        (p) => p.title && p.price > 0
      ).length;
    } catch {
      validProductCount = 0;
    }

    return {
      configured: await this.isConfigured(),
      enabled: creds.enabled,
      hasFeed: true,
      hasShop: !!creds.shopName,
      productCount,
      validProductCount,
      excludedCount: productCount - validProductCount,
    };
  }
}

export default TorobService;
