import {NextRequest, NextResponse} from "next/server";
import {deleteBackup} from "@/app/(web)/admin/backup/backup.action";

export async function DELETE(request: NextRequest) {
  try {
    const {fileName} = await request.json();
    await deleteBackup(fileName);
    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({error: "خطا در حذف"}, {status: 500});
  }
}
