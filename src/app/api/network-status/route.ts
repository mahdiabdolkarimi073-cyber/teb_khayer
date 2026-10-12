import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const iranCountryCodes = new Set(["IR", "IRN"]);

function getCountryFromHeaders(request: NextRequest): string | null {
  const country = [
    request.headers.get("x-vercel-ip-country"),
    request.headers.get("cf-ipcountry"),
  ].find(Boolean);

  return country ? country.trim().toUpperCase() : null;
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  return forwardedIp || request.headers.get("x-real-ip")?.trim() || null;
}

function isPublicIp(ip: string): boolean {
  return !(
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.3") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

async function getCountryFromIp(ip: string, signal: AbortSignal): Promise<string | null> {
  const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
    signal,
    headers: { Accept: "text/plain" },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const country = (await response.text()).trim().toUpperCase();
  return country.length === 2 ? country : null;
}

export async function GET(request: NextRequest) {
  const headerCountry = getCountryFromHeaders(request);
  if (headerCountry) {
    return NextResponse.json(
      { isOutsideIran: !iranCountryCodes.has(headerCountry) },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const ip = getClientIp(request);
  if (!ip || !isPublicIp(ip)) {
    return NextResponse.json(
      { isOutsideIran: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const country = await getCountryFromIp(ip, controller.signal);

    return NextResponse.json(
      { isOutsideIran: country ? !iranCountryCodes.has(country) : false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { isOutsideIran: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    clearTimeout(timeout);
  }
}
