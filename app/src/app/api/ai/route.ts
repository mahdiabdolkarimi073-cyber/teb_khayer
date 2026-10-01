import {NextRequest, NextResponse} from "next/server";
import {aiChat, aiProductRecommendation, aiGenerateProductDescription} from "@/backend/modules/providers/ai/AIService";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import prisma from "@backend/modules/prisma/Prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({error: "لطفاً وارد شوید"}, {status: 401});

    const body = await request.json();
    const {action} = body;

    if (action === "chat") {
      const {messages} = body;
      const response = await aiChat(messages);
      return NextResponse.json(response);
    }

    if (action === "product_recommendation") {
      const {productId, query} = body;
      const product = await prisma.product.findUnique({where: {id: productId}});
      if (!product) return NextResponse.json({error: "محصول یافت نشد"}, {status: 404});
      const content = await aiProductRecommendation(product.name, product.description_text, query);
      return NextResponse.json({content});
    }

    if (action === "generate_description") {
      if (user.role !== "ADMIN") return NextResponse.json({error: "دسترسی غیرمجاز"}, {status: 403});
      const {name, keywords} = body;
      const content = await aiGenerateProductDescription(name, keywords);
      return NextResponse.json({content});
    }

    return NextResponse.json({error: "action نامعتبر"}, {status: 400});
  } catch (error) {
    return NextResponse.json({error: "خطا در ارتباط با سرویس هوش مصنوعی"}, {status: 500});
  }
}
