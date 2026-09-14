"use server";

import {Course, Prisma} from "@prisma/client";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import prisma from "@backend/modules/prisma/Prisma";
import UserCourseCreateArgs = Prisma.UserCourseCreateArgs;

export async function createPortalForCourse(course: Course) {
	console.log('[COURSE-PAYMENT] START - course:', course.id, 'price:', course.price);
	const user = await getUserFromCookie();
	console.log('[COURSE-PAYMENT] user:', user?.id || 'NOT FOUND');
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

	console.log('[COURSE-PAYMENT] creating payment record, amount:', +(course.price+""));
	const payment = await prisma.payment.create({
		data: {
			amount: +(course.price+""),
			userId: user.id,
			successMsg: `دوره ${course.name} باموفقیت خریداری شد`
		}
	});
	console.log('[COURSE-PAYMENT] payment created:', payment.id);

	await prisma.paymentAction.create({
		data: {
			paymentId: payment.id,
			type: "CREATE_MODEL",
			targetModel: "userCourse",
			data: creationData
		}
	})

	console.log('[COURSE-PAYMENT] generating token...');
	let token;
	try {
		token = await payment.getToken();
		console.log('[COURSE-PAYMENT] token generated:', !!token);
	} catch (tokenError) {
		console.error('[COURSE-PAYMENT] token generation FAILED:', tokenError);
		await prisma.payment.delete({where: {id: payment.id}}).catch(() => {});
		throw new Error('خطا در ایجاد توکن پرداخت: ' + (tokenError instanceof Error ? tokenError.message : String(tokenError)));
	}
	return token;
}
