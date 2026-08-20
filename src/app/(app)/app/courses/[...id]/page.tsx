import prisma from "@backend/modules/prisma/Prisma";
import React from "react";
import Link from "next/link";
import CategoryView from "@/app/(app)/app/courses/CategoryView";
import {IconEye, IconEyeCog, IconEyeFilled, IconHeart} from "@tabler/icons-react";
import {Course} from "@prisma/client";

export function CourseItem(props: { course: Course & {_count: {views: number, likes: number}} }) {
	return <div className={"w-1/2 p-2"}>
		<Link href={`/app/course/${props.course.id}`}>
			<div className={"center flex-col gap-2 border rounded-2xl p-2 overflow-hidden h-full justify-between bg-white shadow"}>
				<img loading={'lazy'} alt={props.course.name} src={props.course.thumbnail}
					className={"w-full h-[150px] object-cover rounded-xl"}/>
				<div className={"center  flex-col items-start h-fit flex-grow w-full px-2"}>
					<p className={"text-start text-md"}>{props.course.name}</p>
					<small className={"text-xs"}>{!!props.course.price ? props.course.price?.toLocaleString?.("fa")+" تومان":"رایگان"}</small>
				</div>
				<div className={"center justify-between w-full px-3 pb-1"}>
					<div className="center text-primary gap-1">
						<IconEye size={"1rem"}/>
						<small className={"text-xs"}>{props.course._count.views}</small>
					</div>
					<div className="center gap-1" style={{color: "#ff0055"}}>
						<small className={"text-xs"}>{props.course._count.likes}</small>
						<IconHeart size={"1rem"}/>
					</div>
				</div>
			</div>
		</Link>
	</div>;
}

const Page = async (props: any) => {
	const targetId = props?.params?.id?.pop?.();
	const category = await prisma.category.findUnique({
		where: {
			id: targetId
		},
		include: {
			children: {
				orderBy: {
					created_at: "asc"
				}
			},
			courses: {
				orderBy: {
					created_at: "asc"
				},
				include: {
					_count: {
						select: {
							views: true,
							likes: true,
						}
					}
				}
			}
		}
	});

	return (
		<div className={'flex flex-wrap'}>
			{category?.children?.map(c => (
				<div className={'w-1/2 p-2'}>
					<Link href={`./${targetId}/${c?.id}`}>
						<CategoryView {...c} />
					</Link>
				</div>

			))}
			{category?.courses?.map?.(course => (
				<CourseItem course={course}/>
			))}
		</div>
	)
}

export const generateMetadata = async (props: any) => {
	const targetId = props?.params?.id?.pop?.();
	const cat = await prisma.category.findUnique({
		where: {
			id: targetId
		}
	});

	return {
		title: cat?.name
	}
}

export default Page;
