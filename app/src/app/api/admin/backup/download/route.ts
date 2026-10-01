import {NextRequest, NextResponse} from "next/server";
import {getBackupFileBuffer} from "@/app/(web)/admin/backup/backup.action";

export async function GET(request: NextRequest) {
  try {
    const fileName = request.nextUrl.searchParams.get("id");
    if (!fileName) return NextResponse.json({error: "شناسه الزامی است"}, {status: 400});
    const buffer = await getBackupFileBuffer(fileName);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({error: "دسترسی غیرمجاز"}, {status: 403});
  }
}
