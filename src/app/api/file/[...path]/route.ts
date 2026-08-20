import * as fs from "fs";
import {NextRequest, NextResponse} from "next/server";
import mime from "mime";
import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";

export async function GET(req: NextRequest,res: any) {
	const params = res.params?.path as string[];
	const location = params?.join?.('/');

	const theRealPath = `/api/file/${location}`
	const attachment = await prisma.attachment.findFirst({
		where: {
			link: theRealPath
		},
		include: {
			course: true
		}
	});
	if (!!attachment) {
		const user = await getUserFromCookie(req.nextUrl.searchParams.get('token') || undefined);
		if (!user) return new Response("Authentication Required", {status: 401});
		const userCourse = await prisma.userCourse.findFirst({
			where: {
				courseId: attachment.courseId,
				userId: user.id
			}
		});

		if (!userCourse && user.role !== "ADMIN") return new Response("شما این دوره را خریداری نکرده اید", {status: 403});
	}

	const path = process.cwd()+`/public/backend/uploaded/${location}`;
	const mime_type = mime.getType(path) || 'application/octet-stream';

	try {
		const stat = fs.statSync(path);

		if (mime_type?.includes("video")) {
			const range = req.headers.get("range");
			if (!!range) return getVideoStream(range, path,mime_type);
		}

		// @ts-ignore
		return new NextResponse(fs.createReadStream(path), {
			headers: {
				"content-type": mime_type,
				"content-length": stat.size
			}
		});
	} catch (e) {
		const path = process.cwd()+`/public/backend/images/default_thumbnail.png`;
		const buffer = fs.readFileSync(path);
		return new NextResponse(buffer, {
			headers: {
				"content-type": mime_type
			}
		});
	}
}

export async function OPTIONS(req: NextRequest, res: any) {
	const params = res.params?.path as string[];
	const location = params?.join?.('/');
	const path = process.cwd()+`/public/backend/uploaded/${location}`;

	if (!fs.existsSync(path)) {
		return NextResponse.json({
			exists: false
		}, {status: 404})
	}

	const mime_type = mime.getType(path) || 'application/octet-stream';
	const stat = fs.statSync(path);

	return NextResponse.json({
		type: mime_type,
		size: stat.size,
		date: stat.ctime.getTime(),
		exists: true
	})
}

const CHUNK_SIZE = 1000000 // 1MB
async function getVideoStream(range: string, filePath: string, mimetype: string =  "video/mp4") {
	if (!range) {
		return new Response("Range header missing", { status: 400 })
	}

	const stat = fs.statSync(filePath)
	const fileSize = stat.size

	const chunkStart = Number(range.replace(/\D/g, "")) || 0
	const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, fileSize - 1)

	const contentLength = chunkEnd - chunkStart + 1

	const headers = {
		"Content-Range": `bytes ${chunkStart}-${chunkEnd}/${fileSize}`,
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength.toString(),
		"Content-Type": mimetype,
	}

	const videoStream = fs.createReadStream(filePath, { start: chunkStart, end: chunkEnd })
	// @ts-ignore
	return new Response(videoStream, {status: 206, headers})
}
