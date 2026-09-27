export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import TorobService from "@backend/modules/torob/TorobService";

export async function GET(req: NextRequest) {
	const enabled = await TorobService.isConfigured();
	if (!enabled) {
		return NextResponse.json({ error: "Torob feed is disabled" }, { status: 403 });
	}

	const feed = await TorobService.generateFeed();

	return NextResponse.json(feed, {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
