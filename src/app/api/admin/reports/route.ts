import {NextRequest, NextResponse} from "next/server";
import {getReportData} from "@/app/(web)/admin/reports/reports.action";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const startDate = params.get("startDate") || new Date().toISOString();
  const endDate = params.get("endDate") || new Date().toISOString();
  const groupBy = (params.get("groupBy") || "day") as "day" | "week" | "month";
  try {
    return NextResponse.json(await getReportData(startDate, endDate, groupBy, params.get("category") || undefined, params.get("status") || undefined));
  } catch {
    return NextResponse.json({error: "دسترسی غیرمجاز"}, {status: 403});
  }
}
