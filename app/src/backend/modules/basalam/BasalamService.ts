import { getVar, setVar } from "@backend/utils/setting";

const BASALAM_API_BASE = "https://api.basalam.com";
const BASALAM_OAUTH_BASE = "https://oauth.basalam.com";
const BASALAM_AUTH_BASE = "https://auth.basalam.com";

export interface BasalamTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface BasalamProduct {
  id?: number;
  name: string;
  price: number;
  old_price?: number;
  inventory?: number;
  description?: string;
  photos?: { id: number; url: string }[];
  category_id?: number;
  status?: string;
}

export interface BasalamOrder {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
  customer?: { name: string; phone: string };
  items?: { product_id: number; name: string; price: number; quantity: number }[];
}

export interface BasalamBooth {
  id: number;
  name: string;
  description?: string;
  logo?: string;
}

export class BasalamService {
  static async getCredentials() {
    const [enabled, clientId, clientSecret, accessToken, refreshToken, boothId, patToken] = await Promise.all([
      getVar<string>("BASALAM_ENABLED"),
      getVar<string>("BASALAM_CLIENT_ID"),
      getVar<string>("BASALAM_CLIENT_SECRET"),
      getVar<string>("BASALAM_ACCESS_TOKEN"),
      getVar<string>("BASALAM_REFRESH_TOKEN"),
      getVar<string>("BASALAM_BOOTH_ID"),
      getVar<string>("BASALAM_PAT_TOKEN"),
    ]);

    return {
      enabled: enabled === "true",
      clientId,
      clientSecret,
      accessToken,
      refreshToken,
      boothId,
      patToken,
    };
  }

  static async isConfigured() {
    const creds = await this.getCredentials();
    if (creds.patToken) return true;
    return !!(creds.clientId && creds.clientSecret);
  }

  static async getValidToken(): Promise<string | null> {
    const creds = await this.getCredentials();

    if (creds.patToken) {
      return creds.patToken;
    }

    if (creds.accessToken) {
      return creds.accessToken;
    }

    if (creds.clientId && creds.clientSecret) {
      const token = await this.fetchClientCredentialsToken(creds.clientId, creds.clientSecret);
      return token.access_token;
    }

    return null;
  }

  static async fetchClientCredentialsToken(clientId: string, clientSecret: string): Promise<BasalamTokenResponse> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(`${BASALAM_OAUTH_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Basalam OAuth token error (${res.status}): ${text}`);
    }

    const token: BasalamTokenResponse = await res.json();

    await setVar("BASALAM_ACCESS_TOKEN", token.access_token);
    if (token.refresh_token) {
      await setVar("BASALAM_REFRESH_TOKEN", token.refresh_token);
    }

    return token;
  }

  static async refreshAccessToken(): Promise<string | null> {
    const creds = await this.getCredentials();
    if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) return null;

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: creds.refreshToken,
    });

    const res = await fetch(`${BASALAM_OAUTH_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[BASALAM] refresh token failed:", res.status, text);
      await setVar("BASALAM_ACCESS_TOKEN", "");
      return null;
    }

    const token: BasalamTokenResponse = await res.json();
    await setVar("BASALAM_ACCESS_TOKEN", token.access_token);
    if (token.refresh_token) {
      await setVar("BASALAM_REFRESH_TOKEN", token.refresh_token);
    }

    return token.access_token;
  }

  static async buildAuthUrl(redirectUri: string): Promise<string> {
    const creds = await this.getCredentials();
    if (!creds.clientId) throw new Error("Client ID تنظیم نشده است");

    const params = new URLSearchParams({
      client_id: creds.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
    });

    return `${BASALAM_AUTH_BASE}/authorize?${params.toString()}`;
  }

  static async exchangeAuthCode(code: string, redirectUri: string): Promise<BasalamTokenResponse> {
    const creds = await this.getCredentials();
    if (!creds.clientId || !creds.clientSecret) throw new Error("Client credentials تنظیم نشده است");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const res = await fetch(`${BASALAM_OAUTH_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Basalam OAuth code exchange error (${res.status}): ${text}`);
    }

    const token: BasalamTokenResponse = await res.json();
    await setVar("BASALAM_ACCESS_TOKEN", token.access_token);
    if (token.refresh_token) {
      await setVar("BASALAM_REFRESH_TOKEN", token.refresh_token);
    }

    return token;
  }

  static async apiCall<T = any>(
    path: string,
    method: string = "GET",
    body?: any,
    retry: boolean = true
  ): Promise<T> {
    const token = await this.getValidToken();
    if (!token) throw new Error("توکن باسلام تنظیم نشده است");

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
    if (body) headers["Content-Type"] = "application/json";

    const res = await fetch(`${BASALAM_API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && retry) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        return this.apiCall<T>(path, method, body, false);
      }
      throw new Error("احراز هویت باسلام ناموفق بود - توکن نامعتبر");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Basalam API error (${res.status}) on ${path}: ${text}`);
    }

    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
  }

  static async getBooth(): Promise<BasalamBooth | null> {
    const creds = await this.getCredentials();
    if (!creds.boothId) return null;
    try {
      return await this.apiCall<BasalamBooth>(`/v1/booths/${creds.boothId}`);
    } catch (e) {
      console.error("[BASALAM] getBooth error:", e);
      return null;
    }
  }

  static async getProducts(page: number = 1, perPage: number = 50): Promise<{ data: BasalamProduct[]; total: number }> {
    const creds = await this.getCredentials();
    if (!creds.boothId) throw new Error("شناسه غرفه تنظیم نشده است");
    return this.apiCall(`/v1/booths/${creds.boothId}/products?page=${page}&per_page=${perPage}`);
  }

  static async createProduct(product: Partial<BasalamProduct>): Promise<BasalamProduct> {
    const creds = await this.getCredentials();
    if (!creds.boothId) throw new Error("شناسه غرفه تنظیم نشده است");
    return this.apiCall(`/v1/booths/${creds.boothId}/products`, "POST", product);
  }

  static async updateProduct(productId: number, product: Partial<BasalamProduct>): Promise<BasalamProduct> {
    const creds = await this.getCredentials();
    if (!creds.boothId) throw new Error("شناسه غرفه تنظیم نشده است");
    return this.apiCall(`/v1/booths/${creds.boothId}/products/${productId}`, "PUT", product);
  }

  static async updateInventory(productId: number, inventory: number): Promise<void> {
    const creds = await this.getCredentials();
    if (!creds.boothId) throw new Error("شناسه غرفه تنظیم نشده است");
    await this.apiCall(`/v1/booths/${creds.boothId}/products/${productId}/inventory`, "PUT", { inventory });
  }

  static async getOrders(page: number = 1, perPage: number = 50): Promise<{ data: BasalamOrder[]; total: number }> {
    const creds = await this.getCredentials();
    if (!creds.boothId) throw new Error("شناسه غرفه تنظیم نشده است");
    return this.apiCall(`/v1/booths/${creds.boothId}/orders?page=${page}&per_page=${perPage}`);
  }

  static async getOrder(orderId: number): Promise<BasalamOrder> {
    const creds = await this.getCredentials();
    if (!creds.boothId) throw new Error("شناسه غرفه تنظیم نشده است");
    return this.apiCall(`/v1/booths/${creds.boothId}/orders/${orderId}`);
  }

  static async testConnection(): Promise<{ success: boolean; message: string; booth?: BasalamBooth }> {
    try {
      const token = await this.getValidToken();
      if (!token) {
        return { success: false, message: "توکن باسلام تنظیم نشده است" };
      }
      const booth = await this.getBooth();
      if (booth) {
        return { success: true, message: `اتصال موفق - غرفه: ${booth.name}`, booth };
      }
      return { success: true, message: "اتصال برقرار است (غرفه تنظیم نشده)" };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : String(e) };
    }
  }
}

export default BasalamService;
