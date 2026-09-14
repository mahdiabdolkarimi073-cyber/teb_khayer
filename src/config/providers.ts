export type ProviderType = "AI" | "SMS" | "PAYMENT" | "LOYALTY" | "NOTIFICATION";

export interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  options?: Record<string, any>;
}

export interface ProvidersConfig {
  AI: ProviderConfig;
  SMS: ProviderConfig;
  PAYMENT: ProviderConfig;
  LOYALTY: ProviderConfig;
  NOTIFICATION: ProviderConfig;
}

export const defaultProvidersConfig: ProvidersConfig = {
  AI: {enabled: false},
  SMS: {enabled: false},
  PAYMENT: {enabled: true, endpoint: "sepehr"},
  LOYALTY: {enabled: false},
  NOTIFICATION: {enabled: false},
};

export function loadProvidersConfig(): ProvidersConfig {
  return {
    AI: {
      enabled: process.env.AI_ENABLED === "true",
      apiKey: process.env.AI_API_KEY,
      endpoint: process.env.AI_ENDPOINT || "https://api.openai.com/v1",
      options: {model: process.env.AI_MODEL || "gpt-4o-mini"},
    },
    SMS: {
      enabled: !!process.env.SMS_API_KEY,
      apiKey: process.env.SMS_API_KEY,
      endpoint: process.env.SMS_ENDPOINT,
    },
    PAYMENT: {
      enabled: true,
      endpoint: "sepehr",
    },
    LOYALTY: {
      enabled: process.env.LOYALTY_ENABLED === "true",
    },
    NOTIFICATION: {
      enabled: !!process.env.NOTIFICATION_ENDPOINT,
      endpoint: process.env.NOTIFICATION_ENDPOINT,
    },
  };
}
