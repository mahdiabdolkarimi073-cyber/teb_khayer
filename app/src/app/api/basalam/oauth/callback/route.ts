import { NextRequest, NextResponse } from "next/server";
import BasalamService from "@backend/modules/basalam/BasalamService";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/basalam?oauth_error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/admin/basalam?oauth_error=no_code`, req.url)
    );
  }

  const redirectUri = `${new URL(req.url).origin}/api/basalam/oauth/callback`;

  try {
    await BasalamService.exchangeAuthCode(code, redirectUri);
    return NextResponse.redirect(
      new URL(`/admin/basalam?oauth_success=true`, req.url)
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.redirect(
      new URL(`/admin/basalam?oauth_error=${encodeURIComponent(message)}`, req.url)
    );
  }
}
