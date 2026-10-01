import {getProvider, isProviderEnabled, registerProvider} from "@/backend/modules/providers/ProviderRegistry";
import {OpenAICompatibleProvider} from "@/backend/modules/providers/ai/OpenAICompatibleProvider";
import {AIChatMessage, AIChatResponse} from "@/backend/modules/providers/ProviderRegistry";

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  if (isProviderEnabled("AI")) {
    registerProvider("AI", new OpenAICompatibleProvider());
  }
}

export async function aiChat(
  messages: AIChatMessage[],
  options?: Record<string, any>,
): Promise<AIChatResponse> {
  ensureInitialized();
  const provider = getProvider("AI");
  if (!provider) {
    return {
      content: "قابلیت هوش مصنوعی در حال حاضر فعال نیست. لطفاً بعداً تلاش کنید.",
    };
  }
  return provider.chat(messages, options);
}

export async function aiProductRecommendation(
  productName: string,
  productDescription: string,
  userQuery?: string,
): Promise<string> {
  const systemPrompt = "شما یک مشاور طب سنتی و گیاهان دارویی هستید. به سوالات کاربران به صورت کوتاه و مفید پاسخ دهید.";
  const userPrompt = userQuery
    ? `کاربر در مورد محصول "${productName}" سوال می‌کند: ${userQuery}`
    : `کاربر می‌خواهد اطلاعات بیشتری درباره محصول "${productName}" بداند. توضیحات محصول: ${productDescription}`;

  const response = await aiChat([
    {role: "system", content: systemPrompt},
    {role: "user", content: userPrompt},
  ], {maxTokens: 300});

  return response.content;
}

export async function aiGenerateProductDescription(name: string, keywords?: string): Promise<string> {
  const systemPrompt = "شما یک متخصص تولید محتوا برای فروشگاه طب سنتی هستید. توضیحات محصول را به فارسی و به صورت حرفه‌ای بنویسید.";
  const userPrompt = `نام محصول: ${name}${keywords ? `\nکلمات کلیدی: ${keywords}` : ""}`;

  const response = await aiChat([
    {role: "system", content: systemPrompt},
    {role: "user", content: userPrompt},
  ], {maxTokens: 500});

  return response.content;
}
