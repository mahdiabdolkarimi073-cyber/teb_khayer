import { getVar, setVar } from "@backend/utils/setting";

const DIGIKALA_API_BASE = "https://seller.digikala.com/api/v1";

export interface DigikalaProduct {
  id?: number;
  product_id?: number;
  title_fa?: string;
  title_en?: string;
  price?: number;
  rrp_price?: number;
  selling_price?: number;
  status?: string;
  inventory?: number;
  brand?: { name_fa?: string; name_en?: string };
  category?: { title_fa?: string; title_en?: string };
  images?: { main?: string; list?: string[] };
  variant_id?: number;
}

export interface DigikalaOrder {
  id: number;
  status: string;
  total_price: number;
  total_discount: number;
  shipping_price: number;
  created_at: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  items?: {
    product_id: number;
    title_fa: string;
    price: number;
    quantity: number;
    variant_id?: number;
  }[];
  shipment?: {
    status?: string;
    tracking_code?: string;
    shipping_method?: string;
  };
}

export interface DigikalaSellerInfo {
  id: number;
  title_fa: string;
  title_en?: string;
  logo?: string;
}

export class DigikalaService {
  static async getCredentials() {
    const [enabled, apiToken, sellerId, link, webhookSecret] = await Promise.all([
      getVar<string>("DIGIKALA_ENABLED"),
      getVar<string>("DIGIKALA_API_TOKEN"),
      getVar<string>("DIGIKALA_SELLER_ID"),
      getVar<string>("DIGIKALA_LINK"),
      getVar<string>("DIGIKALA_WEBHOOK_SECRET"),
    ]);

    return {
      enabled: enabled === "true",
      apiToken,
      sellerId,
      link,
      webhookSecret,
    };
  }

  static async isConfigured() {
    const creds = await this.getCredentials();
    return !!creds.apiToken;
  }

  static async apiCall<T = any>(
    path: string,
    method: string = "GET",
    body?: any
  ): Promise<T> {
    const creds = await this.getCredentials();
    if (!creds.apiToken) throw new Error("توکن API دیجی‌کالا تنظیم نشده است");

    const headers: Record<string, string> = {
      Authorization: `Basic ${creds.apiToken}`,
      Accept: "application/json",
    };
    if (body) headers["Content-Type"] = "application/json";

    const res = await fetch(`${DIGIKALA_API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      throw new Error("احراز هویت دیجی‌کالا ناموفق بود - توکن نامعتبر");
    }

    if (res.status === 403) {
      throw new Error("دسترسی غیرمجاز - توکن API دسترسی کافی ندارد");
    }

    if (res.status === 429) {
      throw new Error("محدودیت نرخ درخواست دیجی‌کالا - کمی بعد تلاش کنید");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Digikala API error (${res.status}) on ${path}: ${text}`);
    }

    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
  }

  static async getSellerInfo(): Promise<DigikalaSellerInfo | null> {
    try {
      return await this.apiCall<DigikalaSellerInfo>("/seller/");
    } catch (e) {
      console.error("[DIGIKALA] getSellerInfo error:", e);
      return null;
    }
  }

  static async getProducts(page: number = 1, perPage: number = 50): Promise<{ data: DigikalaProduct[]; total: number }> {
    const res = await this.apiCall<{ data: DigikalaProduct[]; meta?: { total?: number } }>(
      `/products/?page=${page}&per_page=${perPage}`
    );
    return { data: res.data || [], total: res.meta?.total ?? res.data?.length ?? 0 };
  }

  static async getProduct(productId: number): Promise<DigikalaProduct> {
    return this.apiCall<DigikalaProduct>(`/products/${productId}/`);
  }

  static async updateProductPrice(productId: number, price: number, variantId?: number): Promise<void> {
    const body: any = { price };
    if (variantId) body.variant_id = variantId;
    await this.apiCall(`/products/${productId}/price/`, "PUT", body);
  }

  static async updateProductInventory(productId: number, inventory: number, variantId?: number): Promise<void> {
    const body: any = { inventory };
    if (variantId) body.variant_id = variantId;
    await this.apiCall(`/products/${productId}/inventory/`, "PUT", body);
  }

  static async getOrders(page: number = 1, perPage: number = 50): Promise<{ data: DigikalaOrder[]; total: number }> {
    const res = await this.apiCall<{ data: DigikalaOrder[]; meta?: { total?: number } }>(
      `/orders/?page=${page}&per_page=${perPage}`
    );
    return { data: res.data || [], total: res.meta?.total ?? res.data?.length ?? 0 };
  }

  static async getOrder(orderId: number): Promise<DigikalaOrder> {
    return this.apiCall<DigikalaOrder>(`/orders/${orderId}/`);
  }

  static async updateShipment(orderId: number, trackingCode: string, shippingMethod?: string): Promise<void> {
    const body: any = { tracking_code: trackingCode };
    if (shippingMethod) body.shipping_method = shippingMethod;
    await this.apiCall(`/orders/${orderId}/shipment/`, "PUT", body);
  }

  static async testConnection(): Promise<{ success: boolean; message: string; seller?: DigikalaSellerInfo }> {
    try {
      const creds = await this.getCredentials();
      if (!creds.apiToken) {
        return { success: false, message: "توکن API دیجی‌کالا تنظیم نشده است" };
      }
      const seller = await this.getSellerInfo();
      if (seller) {
        return { success: true, message: `اتصال موفق - فروشگاه: ${seller.title_fa}`, seller };
      }
      return { success: true, message: "اتصال برقرار است" };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : String(e) };
    }
  }
}

export default DigikalaService;
