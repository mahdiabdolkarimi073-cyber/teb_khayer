import prisma from "@backend/modules/prisma/Prisma";
import React from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import CategoryView from "@/app/(app)/app/courses/CategoryView";

const Page = async (props: any) => {
	const categories = await prisma.category.findMany({
		orderBy: {
			created_at: "asc"
		},
		where: {
			parentId: {
				equals: null
			}
		},
		include: {
			_count: {
				select: {
					courses: true,
					children: true
				}
			}
		}
	});
	if (categories.length === 1) {
		redirect(`/app/courses/${categories[0]?.id}`);
		return null;
	}
	
	const isEmpty = (c: typeof categories[0])=>c?._count?.courses === 0 && c?._count.children === 0

	const hasCourse = categories.filter(c => !isEmpty(c));
	const nHasCourse = categories.filter(isEmpty);


	return (
		<>
			<div className={'flex flex-wrap bg-gray-100'}>
				{hasCourse.map(c => (
					<div className={'w-1/2 p-2'}>
						<Link href={`./courses/${c.id}`}>
							<CategoryView {...c} />
						</Link>
					</div>
				))}
			</div>
			<br/>
			<div className={'center w-full gap-2 px-2'}>
				<p>به زودی</p>
				<div className={'h-[1px] flex-grow bg-gray-300'}/>
			</div>
			<div className={'flex flex-wrap bg-gray-100'}>
				{nHasCourse.map(c => (
					<div className={'w-1/2 p-2'}>
						<Link href={`./courses/${c.id}`}>
							<CategoryView {...c} soon={true} />
						</Link>
					</div>
				))}
			</div>
		</>
	)
}

export const revalidate = 3600

export const metadata = {
	title: "دوره ها"
}

export default Page;
