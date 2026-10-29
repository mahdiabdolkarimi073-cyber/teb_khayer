import { NextRequest, NextResponse } from "next/server";
import { SmsService } from "@backend/modules/sms/SmsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const result = await SmsService.processDueReminders();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
