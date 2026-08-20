import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React from "react";
import {CourseItem} from "@/app/(app)/app/courses/[...id]/page";

const Page = async (props: any) => {
	const user = await getUserFromCookie();
	const likes = (await prisma.like.findMany({
		where: {
			userId: user?.id
		},
		include: {
			course: {
				include: {
					_count: {
						select: {
							views: true,
							likes: true
						}
					}
				}
			}
		}
	})).map(c => c.course);

	return (
		<div className={'center'}>
			{likes.map(l => <CourseItem course={l} />)}
		</div>
	)
}

export const metadata = {
	title: "علاقه مندی ها"
}
export default Page;
