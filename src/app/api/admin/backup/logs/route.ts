import {NextResponse} from "next/server";
import {getBackupLogs} from "@/app/(web)/admin/backup/backup.action";

export async function GET() {
  try {
    return NextResponse.json(await getBackupLogs());
  } catch {
    return NextResponse.json({error: "دسترسی غیرمجاز"}, {status: 403});
  }
}
