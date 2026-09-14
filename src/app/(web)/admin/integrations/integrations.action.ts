"use server";

import {loadProvidersConfig} from "@/config/providers";
import {getUserFromCookie} from "@/utils/serverComponents/user";

export interface ProviderStatus {
  type: string;
  enabled: boolean;
  hasApiKey: boolean;
  endpoint?: string;
  model?: string;
}

export async function getProviderStatuses(): Promise<ProviderStatus[]> {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const config = loadProvidersConfig();
  return [
    {type: "هوش مصنوعی", enabled: config.AI.enabled, hasApiKey: !!config.AI.apiKey, endpoint: config.AI.endpoint, model: config.AI.options?.model},
    {type: "پیامک", enabled: config.SMS.enabled, hasApiKey: !!config.SMS.apiKey, endpoint: config.SMS.endpoint},
    {type: "درگاه پرداخت", enabled: config.PAYMENT.enabled, endpoint: config.PAYMENT.endpoint},
    {type: "باشگاه مشتریان", enabled: config.LOYALTY.enabled},
    {type: "اعلان‌رسانی", enabled: config.NOTIFICATION.enabled, endpoint: config.NOTIFICATION.endpoint},
  ];
}
