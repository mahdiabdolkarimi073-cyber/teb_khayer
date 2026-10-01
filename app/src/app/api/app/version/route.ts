import {NextResponse} from "next/server";
import {appVersionConfig} from "@/config/app-version";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    latestVersion: appVersionConfig.latestVersion,
    minRequiredVersion: appVersionConfig.minRequiredVersion,
    forceUpdate: appVersionConfig.forceUpdate,
    updateUrl: appVersionConfig.updateUrl,
    releaseNotes: appVersionConfig.releaseNotes,
  });
}
