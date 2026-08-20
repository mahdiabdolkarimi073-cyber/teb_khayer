"use server";

import {Course, Prisma} from "@prisma/client";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import prisma from "@backend/modules/prisma/Prisma";
import UserCourseCreateArgs = Prisma.UserCourseCreateArgs;

export async function createPortalForCourse(course: Course) {
	const user = await getUserFromCookie();
	if (!user) return null;

	const creationData = {
		userId: user.id,
		courseId: course.id
	};

	if (!!(await prisma.userCourse.findFirst({
		where: creationData
	}))) {
		return "FREE";
	}

	if (course.price <= 0) {
		await prisma.userCourse.create({
			data: creationData
		});

		return "FREE";
	}

	const payment = await prisma.payment.create({
		data: {
			amount: +(course.price+""),
			userId: user.id,
			successMsg: `دوره ${course.name} باموفقیت خریداری شد`
		}
	});

	await prisma.paymentAction.create({
		data: {
			paymentId: payment.id,
			type: "CREATE_MODEL",
			targetModel: "userCourse",
			data: creationData
		}
	})

	return await payment.getToken();
}
