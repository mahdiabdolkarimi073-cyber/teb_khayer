import { getVar, setVar } from "@backend/utils/setting";

const DIGIKALA_OPEN_API_BASE = "https://seller.digikala.com/open-api/v1";
const DIGIKALA_LEGACY_API_BASE = "https://seller.digikala.com/api/v1";

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

export interface DigikalaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface DigikalaCredentials {
  enabled: boolean;
  apiToken: string;
  sellerId: string;
  link: string;
  webhookSecret: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  tokenExpires: string;
}

export class DigikalaService {
  static async getCredentials(): Promise<DigikalaCredentials> {
    const [
      enabled, apiToken, sellerId, link, webhookSecret,
      clientId, clientSecret, accessToken, refreshToken, tokenExpires,
    ] = await Promise.all([
      getVar<string>("DIGIKALA_ENABLED"),
      getVar<string>("DIGIKALA_API_TOKEN"),
      getVar<string>("DIGIKALA_SELLER_ID"),
      getVar<string>("DIGIKALA_LINK"),
      getVar<string>("DIGIKALA_WEBHOOK_SECRET"),
      getVar<string>("DIGIKALA_CLIENT_ID"),
      getVar<string>("DIGIKALA_CLIENT_SECRET"),
      getVar<string>("DIGIKALA_ACCESS_TOKEN"),
      getVar<string>("DIGIKALA_REFRESH_TOKEN"),
      getVar<string>("DIGIKALA_TOKEN_EXPIRES"),
    ]);

    return {
      enabled: enabled === "true",
      apiToken,
      sellerId,
      link,
      webhookSecret,
      clientId,
      clientSecret,
      accessToken,
      refreshToken,
      tokenExpires,
    };
  }

  static async isConfigured(): Promise<boolean> {
    const creds = await this.getCredentials();
    return !!(creds.clientId && creds.clientSecret) || !!creds.apiToken;
  }

  static isTokenExpired(expiresAt: string): boolean {
    if (!expiresAt) return true;
    const expiry = new Date(expiresAt).getTime();
    if (isNaN(expiry)) return true;
    return Date.now() >= expiry - 60_000;
  }

  static async authenticate(): Promise<DigikalaTokenResponse> {
    const creds = await this.getCredentials();

    if (!creds.clientId || !creds.clientSecret) {
      throw new Error("Client ID و Client Secret دیجی‌کالا تنظیم نشده است");
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    });

    const res = await fetch(`${DIGIKALA_OPEN_API_BASE}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`احراز هویت دیجی‌کالا ناموفق (${res.status}): ${text}`);
    }

    const tokenData: DigikalaTokenResponse = await res.json();

    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

    await setVar("DIGIKALA_ACCESS_TOKEN", tokenData.access_token);
    if (tokenData.refresh_token) {
      await setVar("DIGIKALA_REFRESH_TOKEN", tokenData.refresh_token);
    }
    await setVar("DIGIKALA_TOKEN_EXPIRES", expiresAt);

    return tokenData;
  }

  static async refreshAccessToken(): Promise<DigikalaTokenResponse> {
    const creds = await this.getCredentials();

    if (!creds.refreshToken) {
      return this.authenticate();
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: creds.refreshToken,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    });

    const res = await fetch(`${DIGIKALA_OPEN_API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      return this.authenticate();
    }

    const tokenData: DigikalaTokenResponse = await res.json();
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

    await setVar("DIGIKALA_ACCESS_TOKEN", tokenData.access_token);
    if (tokenData.refresh_token) {
      await setVar("DIGIKALA_REFRESH_TOKEN", tokenData.refresh_token);
    }
    await setVar("DIGIKALA_TOKEN_EXPIRES", expiresAt);

    return tokenData;
  }

  static async getValidAccessToken(): Promise<string> {
    const creds = await this.getCredentials();

    if (creds.accessToken && !this.isTokenExpired(creds.tokenExpires)) {
      return creds.accessToken;
    }

    if (creds.refreshToken) {
      const tokenData = await this.refreshAccessToken();
      return tokenData.access_token;
    }

    const tokenData = await this.authenticate();
    return tokenData.access_token;
  }

  static async revokeToken(): Promise<void> {
    const creds = await this.getCredentials();
    if (!creds.accessToken) return;

    try {
      const body = new URLSearchParams({
        token: creds.accessToken,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
      });

      await fetch(`${DIGIKALA_OPEN_API_BASE}/auth/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body.toString(),
      });
    } catch (e) {
      console.error("[DIGIKALA] revoke error:", e);
    }

    await setVar("DIGIKALA_ACCESS_TOKEN", "");
    await setVar("DIGIKALA_REFRESH_TOKEN", "");
    await setVar("DIGIKALA_TOKEN_EXPIRES", "");
  }

  static async apiCall<T = any>(
    path: string,
    method: string = "GET",
    body?: any
  ): Promise<T> {
    const creds = await this.getCredentials();

    let accessToken = creds.accessToken;
    const useOAuth = creds.clientId && creds.clientSecret;

    if (useOAuth) {
      accessToken = await this.getValidAccessToken();
    } else if (creds.apiToken) {
      accessToken = creds.apiToken;
    } else {
      throw new Error("اعتبارنامه دیجی‌کالا تنظیم نشده است — Client ID/Secret یا Dedicated Token وارد کنید");
    }

    const headers: Record<string, string> = {
      Authorization: useOAuth ? `Bearer ${accessToken}` : `Basic ${accessToken}`,
      Accept: "application/json",
    };
    if (body) headers["Content-Type"] = "application/json";

    const baseUrl = useOAuth ? DIGIKALA_OPEN_API_BASE : DIGIKALA_LEGACY_API_BASE;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && useOAuth) {
      const tokenData = await this.authenticate();
      headers.Authorization = `Bearer ${tokenData.access_token}`;
      const retryRes = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retryRes.ok) {
        const text = await retryRes.text();
        throw new Error(`Digikala API error (${retryRes.status}) on ${path}: ${text}`);
      }
      if (retryRes.status === 204) return null as T;
      return retryRes.json() as Promise<T>;
    }

    if (res.status === 401) {
      throw new Error("احراز هویت دیجی‌کالا ناموفق بود — اعتبارنامه نامعتبر");
    }
    if (res.status === 403) {
      throw new Error("دسترسی غیرمجاز — اعتبارنامه دسترسی کافی ندارد");
    }
    if (res.status === 429) {
      throw new Error("محدودیت نرخ درخواست دیجی‌کالا — کمی بعد تلاش کنید");
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
      const creds = await this.getCredentials();
      const useOAuth = creds.clientId && creds.clientSecret;
      const path = useOAuth ? "/seller" : "/seller/";
      return await this.apiCall<DigikalaSellerInfo>(path);
    } catch (e) {
      console.error("[DIGIKALA] getSellerInfo error:", e);
      return null;
    }
  }

  static async getProducts(page: number = 1, perPage: number = 50): Promise<{ data: DigikalaProduct[]; total: number }> {
    const creds = await this.getCredentials();
    const useOAuth = creds.clientId && creds.clientSecret;
    const path = useOAuth
      ? `/draft-products/seller?page=${page}&per_page=${perPage}`
      : `/products/?page=${page}&per_page=${perPage}`;
    const res = await this.apiCall<{ data: DigikalaProduct[]; meta?: { total?: number } }>(path);
    return { data: res.data || [], total: res.meta?.total ?? res.data?.length ?? 0 };
  }

  static async getProduct(productId: number): Promise<DigikalaProduct> {
    const creds = await this.getCredentials();
    const useOAuth = creds.clientId && creds.clientSecret;
    const path = useOAuth ? `/draft-products/${productId}` : `/products/${productId}/`;
    return this.apiCall<DigikalaProduct>(path);
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
    const creds = await this.getCredentials();
    const useOAuth = creds.clientId && creds.clientSecret;
    const path = useOAuth
      ? `/ship-by-seller-orders?page=${page}&per_page=${perPage}`
      : `/orders/?page=${page}&per_page=${perPage}`;
    const res = await this.apiCall<{ data: DigikalaOrder[]; meta?: { total?: number } }>(path);
    return { data: res.data || [], total: res.meta?.total ?? res.data?.length ?? 0 };
  }

  static async getOrder(orderId: number): Promise<DigikalaOrder> {
    const creds = await this.getCredentials();
    const useOAuth = creds.clientId && creds.clientSecret;
    const path = useOAuth ? `/ship-by-seller-orders/${orderId}` : `/orders/${orderId}/`;
    return this.apiCall<DigikalaOrder>(path);
  }

  static async updateShipment(orderId: number, trackingCode: string, shippingMethod?: string): Promise<void> {
    const body: any = { tracking_code: trackingCode };
    if (shippingMethod) body.shipping_method = shippingMethod;
    await this.apiCall(`/orders/${orderId}/shipment/`, "PUT", body);
  }

  static async testConnection(): Promise<{ success: boolean; message: string; seller?: DigikalaSellerInfo }> {
    try {
      const creds = await this.getCredentials();

      if (!creds.clientId && !creds.clientSecret && !creds.apiToken) {
        return { success: false, message: "هیچ اعتبارنامه‌ای تنظیم نشده است — Client ID/Secret یا Dedicated Token وارد کنید" };
      }

      if (creds.clientId && creds.clientSecret) {
        await this.authenticate();
      }

      const seller = await this.getSellerInfo();
      if (seller) {
        return { success: true, message: `اتصال موفق — فروشگاه: ${seller.title_fa}`, seller };
      }
      return { success: true, message: "اتصال برقرار است" };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : String(e) };
    }
  }

  static async connect(): Promise<{ success: boolean; message: string }> {
    try {
      const creds = await this.getCredentials();
      if (!creds.clientId || !creds.clientSecret) {
        return { success: false, message: "Client ID و Client Secret را وارد کنید" };
      }
      await this.authenticate();
      const seller = await this.getSellerInfo();
      return {
        success: true,
        message: seller ? `اتصال موفق — فروشگاه: ${seller.title_fa}` : "اتصال برقرار شد",
      };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : String(e) };
    }
  }

  static async disconnect(): Promise<{ success: boolean; message: string }> {
    try {
      await this.revokeToken();
      await setVar("DIGIKALA_ENABLED", "false");
      return { success: true, message: "اتصال قطع شد" };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : String(e) };
    }
  }
}

export default DigikalaService;
