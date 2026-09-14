import {loadProvidersConfig, ProviderConfig} from "@/config/providers";

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIChatResponse {
  content: string;
  usage?: {promptTokens: number; completionTokens: number};
}

export interface AIProvider {
  chat(messages: AIChatMessage[], options?: Record<string, any>): Promise<AIChatResponse>;
  generateEmbedding(text: string): Promise<number[]>;
}

export interface SMSProvider {
  send(phone: string, message: string): Promise<{success: boolean; trackingId?: string}>;
}

export interface PaymentProvider {
  createPayment(amount: number, callbackUrl: string, orderId?: string): Promise<{redirectUrl: string; authority: string}>;
  verifyPayment(authority: string, amount: number): Promise<{success: boolean; receiptId?: string}>;
}

export interface LoyaltyProvider {
  getPoints(userId: string): Promise<number>;
  addPoints(userId: string, points: number, reason?: string): Promise<void>;
  redeemPoints(userId: string, points: number): Promise<boolean>;
}

export interface NotificationProvider {
  send(userId: string, title: string, body: string): Promise<void>;
  broadcast(title: string, body: string): Promise<void>;
}

export type ProviderRegistry = {
  AI?: AIProvider;
  SMS?: SMSProvider;
  PAYMENT?: PaymentProvider;
  LOYALTY?: LoyaltyProvider;
  NOTIFICATION?: NotificationProvider;
};

const registry: ProviderRegistry = {};

export function registerProvider<K extends keyof ProviderRegistry>(
  type: K,
  provider: ProviderRegistry[K],
) {
  registry[type] = provider;
}

export function getProvider<K extends keyof ProviderRegistry>(type: K): ProviderRegistry[K] | undefined {
  return registry[type];
}

export function isProviderEnabled(type: keyof ProviderRegistry): boolean {
  const config = loadProvidersConfig();
  return config[type]?.enabled ?? false;
}

export function getProviderConfig(type: keyof ProviderRegistry): ProviderConfig {
  const config = loadProvidersConfig();
  return config[type] || {enabled: false};
}
