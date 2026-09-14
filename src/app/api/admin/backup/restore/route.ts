import {NextRequest, NextResponse} from "next/server";
import {restoreBackup} from "@/app/(web)/admin/backup/backup.action";

export async function POST(request: NextRequest) {
  try {
    const {fileName} = await request.json();
    await restoreBackup(fileName);
    return NextResponse.json({success: true});
  } catch (error) {
    return NextResponse.json({error: "خطا در بازیابی"}, {status: 500});
  }
}
