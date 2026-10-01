import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React from "react";
import UserCourseView from "@/app/(app)/app/dashboard/courses/[id]/UserCourseView";
import {notFound} from "next/navigation";

const Page = async (props: any) => {
	const user = await getUserFromCookie();
	const userCourse = await prisma.userCourse.findUnique({
		where: {
			userId: user?.id,
			id: +props?.params?.id
		},
		include: {
			course: {
				include: {
					attachments: true
				}
			}
		}
	});
	if (!userCourse) {
		notFound();
		return null;
	}
	const token = (await prisma.user.findUnique({
		where: {
			id: user?.id
		}
	}))!.token;


	return (
		<div className={''}>
			<UserCourseView userCourse={userCourse} course={userCourse.course} token={token} />
		</div>
	)
}

export const generateMetadata = async (props: any)=>{
	const id = props?.params?.id;
	const userCourse = await prisma.userCourse.findUnique({
		where: {
			id: +id
		},
		include: {
			course: true
		}
	})

	return {
		title: userCourse?.course?.name
	}
}

export default Page;
