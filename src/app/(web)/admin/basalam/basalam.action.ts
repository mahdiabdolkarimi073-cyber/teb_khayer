"use server";

import { getVar, setVar } from "@backend/utils/setting";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import BasalamService from "@backend/modules/basalam/BasalamService";
import BasalamSync, { SyncResult } from "@backend/modules/basalam/BasalamSync";

export interface BasalamConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  boothId: string;
  patToken: string;
  basalamLink: string;
}

export interface BasalamStatus {
  configured: boolean;
  enabled: boolean;
  hasToken: boolean;
  hasBooth: boolean;
  connectionTest?: { success: boolean; message: string };
}

export async function getBasalamConfig(): Promise<BasalamConfig> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  const [enabled, clientId, clientSecret, accessToken, refreshToken, boothId, patToken, basalamLink] = await Promise.all([
    getVar<string>("BASALAM_ENABLED"),
    getVar<string>("BASALAM_CLIENT_ID"),
    getVar<string>("BASALAM_CLIENT_SECRET"),
    getVar<string>("BASALAM_ACCESS_TOKEN"),
    getVar<string>("BASALAM_REFRESH_TOKEN"),
    getVar<string>("BASALAM_BOOTH_ID"),
    getVar<string>("BASALAM_PAT_TOKEN"),
    getVar<string>("BASALAM_LINK"),
  ]);

  return {
    enabled: enabled === "true",
    clientId,
    clientSecret,
    accessToken,
    refreshToken,
    boothId,
    patToken,
    basalamLink,
  };
}

export async function saveBasalamConfig(config: Partial<BasalamConfig>): Promise<void> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  if (config.enabled !== undefined) await setVar("BASALAM_ENABLED", config.enabled ? "true" : "false");
  if (config.clientId !== undefined) await setVar("BASALAM_CLIENT_ID", config.clientId);
  if (config.clientSecret !== undefined) await setVar("BASALAM_CLIENT_SECRET", config.clientSecret);
  if (config.accessToken !== undefined) await setVar("BASALAM_ACCESS_TOKEN", config.accessToken);
  if (config.refreshToken !== undefined) await setVar("BASALAM_REFRESH_TOKEN", config.refreshToken);
  if (config.boothId !== undefined) await setVar("BASALAM_BOOTH_ID", config.boothId);
  if (config.patToken !== undefined) await setVar("BASALAM_PAT_TOKEN", config.patToken);
  if (config.basalamLink !== undefined) await setVar("BASALAM_LINK", config.basalamLink);
}

export async function getBasalamStatus(): Promise<BasalamStatus> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  const creds = await BasalamService.getCredentials();

  return {
    configured: await BasalamService.isConfigured(),
    enabled: creds.enabled,
    hasToken: !!creds.accessToken || !!creds.patToken,
    hasBooth: !!creds.boothId,
  };
}

export async function testBasalamConnection(): Promise<{ success: boolean; message: string }> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return BasalamService.testConnection();
}

export async function syncProductsToBasalam(): Promise<SyncResult> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return BasalamSync.syncProductsToBasalam();
}

export async function syncInventoryToBasalam(): Promise<SyncResult> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return BasalamSync.syncInventoryToBasalam();
}

export async function syncOrdersFromBasalam(): Promise<SyncResult> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return BasalamSync.syncOrdersFromBasalam();
}

export async function getOAuthUrl(redirectUri: string): Promise<string> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return BasalamService.buildAuthUrl(redirectUri);
}

export async function exchangeOAuthCode(code: string, redirectUri: string): Promise<{ success: boolean; message: string }> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  try {
    await BasalamService.exchangeAuthCode(code, redirectUri);
    return { success: true, message: "احراز هویت باسلام موفق بود" };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : String(e) };
  }
}
