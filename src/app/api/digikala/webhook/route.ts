import {NextRequest, NextResponse} from "next/server";
import {getVar} from "@backend/utils/setting";

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = await getVar<string>("DIGIKALA_WEBHOOK_SECRET");
    const authHeader = request.headers.get("authorization") || "";
    const providedToken = authHeader.replace(/^Basic\s+/i, "").replace(/^Bearer\s+/i, "");

    if (webhookSecret && providedToken !== webhookSecret) {
      return NextResponse.json({ok: false, message: "Unauthorized"}, {status: 401});
    }

    const body = await request.json();

    console.log("[DIGIKALA] Webhook received:", JSON.stringify(body).slice(0, 500));

    return NextResponse.json({ok: true});
  } catch (e) {
    console.error("[DIGIKALA] Webhook error:", e);
    return NextResponse.json({ok: true});
  }
}

export async function GET() {
  return NextResponse.json({ok: true, message: "Digikala webhook endpoint"});
}
