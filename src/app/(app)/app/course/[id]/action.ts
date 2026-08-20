"use server";

import {Course} from "@prisma/client";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import prisma from "@backend/modules/prisma/Prisma";

export async function handleCourseView(course: Course) {
	const user = await getUserFromCookie();
	if (!user) return;
	const data = {
		userId: user?.id,
		courseId: course.id
	};
	const previous = await prisma.view.findFirst({
		where: data
	});

	if (!previous) {
		await prisma.view.create({
			data
		})
	}
}
