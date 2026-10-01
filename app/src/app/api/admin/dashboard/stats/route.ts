import {NextResponse} from "next/server";
import {getDashboardStats} from "@/app/(web)/admin/dashboard/dashboard.action";

export async function GET() {
  try {
    return NextResponse.json(await getDashboardStats());
  } catch {
    return NextResponse.json({error: "دسترسی غیرمجاز"}, {status: 403});
  }
}
