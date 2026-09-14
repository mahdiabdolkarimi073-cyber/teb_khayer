import {AIChatMessage, AIChatResponse, AIProvider} from "@/backend/modules/providers/ProviderRegistry";
import {loadProvidersConfig} from "@/config/providers";

export class OpenAICompatibleProvider implements AIProvider {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor() {
    const config = loadProvidersConfig().AI;
    this.apiKey = config.apiKey || "";
    this.endpoint = config.endpoint || "https://api.openai.com/v1";
    this.model = config.options?.model || "gpt-4o-mini";
  }

  async chat(messages: AIChatMessage[], options?: Record<string, any>): Promise<AIChatResponse> {
    const response = await fetch(`${this.endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
      },
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.endpoint}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || [];
  }
}
