"use server";

import { getVar, setVar } from "@backend/utils/setting";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import DigikalaService from "@backend/modules/digikala/DigikalaService";
import DigikalaSync, { DigikalaSyncResult } from "@backend/modules/digikala/DigikalaSync";

export interface DigikalaConfig {
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

export interface DigikalaStatus {
  configured: boolean;
  enabled: boolean;
  hasToken: boolean;
  hasSeller: boolean;
  hasOAuth: boolean;
  connected: boolean;
  tokenExpired: boolean;
}

export async function getDigikalaConfig(): Promise<DigikalaConfig> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

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

export async function saveDigikalaConfig(config: Partial<DigikalaConfig>): Promise<void> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  if (config.enabled !== undefined) await setVar("DIGIKALA_ENABLED", config.enabled ? "true" : "false");
  if (config.apiToken !== undefined) await setVar("DIGIKALA_API_TOKEN", config.apiToken);
  if (config.sellerId !== undefined) await setVar("DIGIKALA_SELLER_ID", config.sellerId);
  if (config.link !== undefined) await setVar("DIGIKALA_LINK", config.link);
  if (config.webhookSecret !== undefined) await setVar("DIGIKALA_WEBHOOK_SECRET", config.webhookSecret);
  if (config.clientId !== undefined) await setVar("DIGIKALA_CLIENT_ID", config.clientId);
  if (config.clientSecret !== undefined) await setVar("DIGIKALA_CLIENT_SECRET", config.clientSecret);
}

export async function getDigikalaStatus(): Promise<DigikalaStatus> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  const creds = await DigikalaService.getCredentials();

  return {
    configured: await DigikalaService.isConfigured(),
    enabled: creds.enabled,
    hasToken: !!creds.apiToken || !!creds.accessToken,
    hasSeller: !!creds.sellerId,
    hasOAuth: !!creds.clientId && !!creds.clientSecret,
    connected: !!creds.accessToken,
    tokenExpired: DigikalaService.isTokenExpired(creds.tokenExpires),
  };
}

export async function testDigikalaConnection(): Promise<{ success: boolean; message: string }> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return DigikalaService.testConnection();
}

export async function connectDigikala(): Promise<{ success: boolean; message: string }> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  const result = await DigikalaService.connect();
  if (result.success) {
    await setVar("DIGIKALA_ENABLED", "true");
  }
  return result;
}

export async function disconnectDigikala(): Promise<{ success: boolean; message: string }> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return DigikalaService.disconnect();
}

export async function syncPricesToDigikala(): Promise<DigikalaSyncResult> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return DigikalaSync.syncPricesToDigikala();
}

export async function syncInventoryToDigikala(): Promise<DigikalaSyncResult> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return DigikalaSync.syncInventoryToDigikala();
}

export async function syncOrdersFromDigikala(): Promise<DigikalaSyncResult> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return DigikalaSync.syncOrdersFromDigikala();
}
