import {NextRequest, NextResponse} from "next/server";
import prisma from "@backend/modules/prisma/Prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";
    await prisma.siteVisit.create({data: {path}});
    return NextResponse.json({ok: true});
  } catch {
    return NextResponse.json({ok: true});
  }
}
