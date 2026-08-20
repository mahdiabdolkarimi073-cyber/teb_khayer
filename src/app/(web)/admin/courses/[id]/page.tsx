import prisma from "@backend/modules/prisma/Prisma";
import {notFound} from "next/navigation";
import NewCourse from "@/app/(web)/admin/courses/new/page";

const Page = async (props: any) => {
	const id = props?.params?.id;
	const course = await prisma.course.findUnique({
		where: {
			id
		},
		include: {
			attachments: true
		}
	});

	if (!course) {
		notFound();
		return null;
	}

	return <NewCourse course={{
		...course,
		// @ts-ignore
		attachments: undefined
	}} attachments={course.attachments} searchParams={{}}/>
}

export default Page;
