"use server";

import {Course, Prisma} from "@prisma/client";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import prisma from "@backend/modules/prisma/Prisma";
import UserCourseCreateArgs = Prisma.UserCourseCreateArgs;
import {paymentLog} from "@/utils/paymentLogger";

export async function createPortalForCourse(course: Course) {
	paymentLog.info('COURSE-PAYMENT', 'START', { courseId: course.id, courseName: course.name, price: course.price });
	const user = await getUserFromCookie();
	paymentLog.debug('COURSE-PAYMENT', 'User from cookie', { userId: user?.id || 'NOT FOUND' });
	if (!user) {
		paymentLog.warn('COURSE-PAYMENT', 'No user found');
		return null;
	}

	const creationData = {
		userId: user.id,
		courseId: course.id
	};

	if (!!(await prisma.userCourse.findFirst({
		where: creationData
	}))) {
		paymentLog.info('COURSE-PAYMENT', 'User already owns this course', { courseId: course.id, userId: user.id });
		return "FREE";
	}

	if (course.price <= 0) {
		paymentLog.info('COURSE-PAYMENT', 'Course is free, granting access directly', { courseId: course.id });
		await prisma.userCourse.create({
			data: creationData
		});
		return "FREE";
	}

	paymentLog.info('COURSE-PAYMENT', 'Creating payment record', { courseId: course.id, amount: +(course.price+"") });
	const payment = await prisma.payment.create({
		data: {
			amount: +(course.price+""),
			userId: user.id,
			successMsg: `دوره ${course.name} باموفقیت خریداری شد`
		}
	});
	paymentLog.debug('COURSE-PAYMENT', 'Payment record created', { paymentId: payment.id });

	await prisma.paymentAction.create({
		data: {
			paymentId: payment.id,
			type: "CREATE_MODEL",
			targetModel: "userCourse",
			data: creationData
		}
	})
	paymentLog.debug('COURSE-PAYMENT', 'Payment action created', { paymentId: payment.id });

	paymentLog.info('COURSE-PAYMENT', 'Generating token', { paymentId: payment.id });
	let token;
	try {
		token = await payment.getToken();
		paymentLog.info('COURSE-PAYMENT', 'Token generated successfully', { paymentId: payment.id, tokenLength: token?.length });
	} catch (tokenError) {
		paymentLog.error('COURSE-PAYMENT', 'Token generation FAILED', {
			paymentId: payment.id,
			error: tokenError instanceof Error ? tokenError.message : String(tokenError),
		});
		await prisma.payment.delete({where: {id: payment.id}}).catch(() => {});
		throw new Error('خطا در ایجاد توکن پرداخت: ' + (tokenError instanceof Error ? tokenError.message : String(tokenError)));
	}
	return token;
}
