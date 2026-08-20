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
	console.log("HEADERS",headers);
	const response = await fetch("https://"+(res?.params?.host?.join?.("/"))+req.nextUrl.search, {
		headers,
		method: req.method,
		...(req.method !== "GET" && ({
			body: await req.arrayBuffer()
		}))
	});

	return new Response(await response.arrayBuffer(), {
		...response,
		headers: Object.fromEntries(['content-type'].map( key => ([key, response.headers.get(key)+""]))),
	})
}
