import {NextRequest, NextResponse} from "next/server";


export  async function GET(req: NextRequest, res: NextResponse) {
	return handle(req,res);
}

export  async function POST(req: NextRequest, res: NextResponse) {
	return handle(req,res);
}

export  async function PUT(req: NextRequest, res: NextResponse) {
	return handle(req,res);
}

export  async function DELETE(req: NextRequest, res: NextResponse) {
	return handle(req,res);
}

export  async function PATCH(req: NextRequest, res: NextResponse) {
	return handle(req,res);
}


export async function handle(req: NextRequest, res: any) {
	const headers =  Object.fromEntries(['user-agent','Host','Accept-Encoding', 'accept','content-type'].map( key => ([key, req.headers.get(key) || ""])).filter(o => !!o[1]));

	let body: ArrayBuffer | undefined;
	if (req.method !== "GET") {
		body = await req.arrayBuffer();
	}

	const targetHost = res?.params?.host?.join?.("/") || "";
	const targetUrl = "https://" + targetHost + req.nextUrl.search;

	console.log(`[PROXY] ${req.method} -> ${targetUrl}`);

	try {
		const response = await fetch(targetUrl, {
			headers,
			method: req.method,
			...(body && ({ body }))
		});

		const responseBuffer = await response.arrayBuffer();

		const responseHeaders = Object.fromEntries(
			['content-type'].map( key => ([key, response.headers.get(key) || ""]))
		);

		return new Response(responseBuffer, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		});
	} catch (e: any) {
		console.error('[PROXY] Error:', e?.message || e);
		return NextResponse.json({ error: 'Proxy request failed', message: e?.message || String(e) }, { status: 502 });
	}
}
