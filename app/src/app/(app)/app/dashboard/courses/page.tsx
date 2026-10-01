import {getUserFromCookie} from "@/utils/serverComponents/user";
import prisma from "@backend/modules/prisma/Prisma";
import React from "react";
import {Button} from "@mantine/core";
import Link from "next/link";

const Page = async (props: any) => {
	const user = await getUserFromCookie();
	const userCourses = await prisma.userCourse.findMany({
		where: {
			userId: user?.id
		},
		include: {
			course: true
		}
	});

	return !userCourses?.length ? (
		<div className={'center h-[200px]'}>
			{userCourses.length}
			<p>موردی یافت نشد</p>
		</div>
	):(
		<div className={'my-2 p-1'}>
			<h3>دوره های خریداری شده</h3>
			<div className={'flex flex-col gap-2 p-2'}>
				{userCourses.map(({course, id}) => (
					<div className={'rounded border p-2 center justify-between'}>
						<small>{course.name}</small>
						<Link href={`/app/dashboard/courses/${id}`}>
							<Button size={'sm'}>
								مشاهده
							</Button>
						</Link>
					</div>
				))}
			</div>
		</div>
	)
}

export const metadata = {
	title: "دوره های من"
}

export default Page;
