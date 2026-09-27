"use server";

import { getVar, setVar } from "@backend/utils/setting";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import TorobService, { TorobConfig, TorobStatus, TorobSyncResult } from "@backend/modules/torob/TorobService";

export async function getTorobConfig(): Promise<TorobConfig> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  const [enabled, shopName, torobLink] = await Promise.all([
    getVar<string>("TOROB_ENABLED"),
    getVar<string>("TOROB_SHOP_NAME"),
    getVar<string>("TOROB_LINK"),
  ]);

  return {
    enabled: enabled === "true",
    shopName,
    feedUrl: await TorobService.getFeedUrl(),
    torobLink,
  };
}

export async function saveTorobConfig(config: Partial<TorobConfig>): Promise<void> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  if (config.enabled !== undefined) await setVar("TOROB_ENABLED", config.enabled ? "true" : "false");
  if (config.shopName !== undefined) await setVar("TOROB_SHOP_NAME", config.shopName);
  if (config.torobLink !== undefined) await setVar("TOROB_LINK", config.torobLink);
}

export async function getTorobStatus(): Promise<TorobStatus> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return TorobService.getStatus();
}

export async function testTorobFeed(): Promise<TorobSyncResult> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("دسترسی غیرمجاز");

  return TorobService.testFeed();
}
