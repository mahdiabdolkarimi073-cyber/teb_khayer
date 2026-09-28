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
}

export interface DigikalaStatus {
  configured: boolean;
  enabled: boolean;
  hasToken: boolean;
  hasSeller: boolean;
}

export async function getDigikalaConfig(): Promise<DigikalaConfig> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  const [enabled, apiToken, sellerId, link, webhookSecret] = await Promise.all([
    getVar<string>("DIGIKALA_ENABLED"),
    getVar<string>("DIGIKALA_API_TOKEN"),
    getVar<string>("DIGIKALA_SELLER_ID"),
    getVar<string>("DIGIKALA_LINK"),
    getVar<string>("DIGIKALA_WEBHOOK_SECRET"),
  ]);

  return { enabled: enabled === "true", apiToken, sellerId, link, webhookSecret };
}

export async function saveDigikalaConfig(config: Partial<DigikalaConfig>): Promise<void> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  if (config.enabled !== undefined) await setVar("DIGIKALA_ENABLED", config.enabled ? "true" : "false");
  if (config.apiToken !== undefined) await setVar("DIGIKALA_API_TOKEN", config.apiToken);
  if (config.sellerId !== undefined) await setVar("DIGIKALA_SELLER_ID", config.sellerId);
  if (config.link !== undefined) await setVar("DIGIKALA_LINK", config.link);
  if (config.webhookSecret !== undefined) await setVar("DIGIKALA_WEBHOOK_SECRET", config.webhookSecret);
}

export async function getDigikalaStatus(): Promise<DigikalaStatus> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  const creds = await DigikalaService.getCredentials();

  return {
    configured: await DigikalaService.isConfigured(),
    enabled: creds.enabled,
    hasToken: !!creds.apiToken,
    hasSeller: !!creds.sellerId,
  };
}

export async function testDigikalaConnection(): Promise<{ success: boolean; message: string }> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return DigikalaService.testConnection();
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
