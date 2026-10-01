import {NextResponse} from "next/server";
import {listBackups} from "@/app/(web)/admin/backup/backup.action";

export async function GET() {
  try {
    return NextResponse.json(await listBackups());
  } catch {
    return NextResponse.json({error: "دسترسی غیرمجاز"}, {status: 403});
  }
}
