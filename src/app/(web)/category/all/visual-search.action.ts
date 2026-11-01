"use server";

import { Product } from "@prisma/client";

export type VisualSearchResultItem = {
  product: Product;
  similarityScore: number; // 0 to 100
  matchReason: string;
};

export type VisualSearchResponse = {
  success: boolean;
  provider: "gemini" | "visual_analysis" | "none";
  message: string;
  items: VisualSearchResultItem[];
  detectedFeatures?: string;
};

/**
 * Server-side visual search action.
 * Removed external @google/genai dependency and artificial mock data.
 * Returns an honest and polite Persian status informing the user of temporary
 * unavailability and recommending product name search.
 */
export async function searchProductsByImage(
  imageDataUrl: string
): Promise<VisualSearchResponse> {
  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return {
      success: false,
      provider: "none",
      message: "تصویری ارسال نشده است.",
      items: [],
    };
  }

  return {
    success: false,
    provider: "none",
    message:
      "جستجوی تصویری در حال حاضر موقتاً در دسترس نیست. لطفاً از جستجوی نام محصول استفاده کنید.",
    items: [],
  };
}
