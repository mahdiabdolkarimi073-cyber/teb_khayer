import {NextRequest, NextResponse} from "next/server";
import {getTransactions} from "@/app/(web)/admin/transactions/transactions.action";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const statusValue = params.get("status") || "all";
  const status = ["all", "successful", "failed", "pending"].includes(statusValue)
    ? statusValue as "all" | "successful" | "failed" | "pending"
    : "all";
  try {
    return NextResponse.json(await getTransactions(
      Number(params.get("page") || 1),
      Number(params.get("limit") || 10),
      params.get("search") || undefined,
      status,
      params.get("startDate") || undefined,
      params.get("endDate") || undefined,
      params.has("minAmount") ? Number(params.get("minAmount")) : undefined,
      params.has("maxAmount") ? Number(params.get("maxAmount")) : undefined,
      params.get("category") || undefined,
    ));
  } catch {
    return NextResponse.json({error: "دسترسی غیرمجاز"}, {status: 403});
  }
}
