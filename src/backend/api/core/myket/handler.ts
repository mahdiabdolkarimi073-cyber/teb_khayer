import Handler from "@backend/modules/Handler";
import {updateFile} from "@backend/utils/file";
import prisma from "@backend/modules/prisma/Prisma";

export default class UploadHandler extends Handler {
	async POST() {
		await prisma.userCourse.create({
			data: {
				userId: this.json.userId,
				courseId: this.json.courseId ?? this.json.id,
			}
		})

		return "OK"
	}
}
