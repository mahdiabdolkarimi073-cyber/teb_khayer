import {NextResponse} from "next/server";
import {createBackup} from "@/app/(web)/admin/backup/backup.action";

export async function POST() {
  try {
    const result = await createBackup();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({error: "دسترسی غیرمجاز یا خطا در ایجاد backup"}, {status: 403});
  }
}
