export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import TorobService from "@backend/modules/torob/TorobService";

export async function GET(req: NextRequest) {
  try {
    const enabled = await TorobService.isConfigured();
    if (!enabled) {
      return NextResponse.json(
        { error: "Torob feed is disabled" },
        { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const feed = await TorobService.generateFeed();

    const jsonBody = JSON.stringify(feed);

    return new NextResponse(jsonBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "خطا در تولید فید",
        detail: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
