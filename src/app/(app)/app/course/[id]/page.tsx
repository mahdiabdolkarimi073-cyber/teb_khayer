import prisma from "@backend/modules/prisma/Prisma";
import {notFound} from "next/navigation";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {Alert, Badge, Button, Text} from '@mantine/core';
import {IconEye, IconInfoCircle} from "@tabler/icons-react";
import LikeButton from "@/app/(app)/app/course/[id]/LikeButton";
import Link from "next/link";
import AppConfig from "@/config/AppConfig";
import Preview from "@/app/(app)/app/course/[id]/Preview";
import {createPortalForCourse} from "@backend/modules/payment/action";
import React from "react";
import CoursePaymentBtn from "@/app/(app)/app/course/[id]/CoursePaymentBtn";

const Page = async (props: any) => {
	const course = await getCourse(props);
	const user = await getUserFromCookie();
	const alreadyBuy =!!(await prisma.userCourse.findFirst({
		where: {
			userId: user?.id,
			courseId: course?.id
		}
	}));
	const liked = !!user ? (await prisma.like.findFirst({
		where: {
			userId: user?.id,
			courseId: course?.id
		}
	})) : undefined;
	if (!course) {
		notFound();
		return null;
	}

	return (
		<div className={'relative'}>
			<div className={'py-3 p-3 relative'}>
				{!user && (
					<Alert variant="light" color="orange" title="نکته" icon={<IconInfoCircle/>}>
						<p>اگر از پیش این دوره را خریداری کرده اید لطفا وارد حساب کاربری خود شوید</p>
						<div className={'center justify-end pt-2'}>
							<Link href={'/app/login'}>
								<Button color={'orange'} size={'xs'}>ورود</Button>
							</Link>
						</div>
					</Alert>
				)}
				<br/>
				<h3>پس از پرداخت هزینه، این دوره برای شما فعال خواهد شد!</h3>
				<br/>
				<hr/>
				<br/>
				<div className={'center justify-start gap-2'}>
					<div style={{width: "10px", height: "10px"}} className={'bg-red-400 rounded-full'}>

					</div>
					<Text fw={'bold'} lineClamp={1}>سر فصل های دوره {course?.name}</Text>
				</div>
				<br/>
				<div className={'center justify-between'}>
					<p>توضیحات دوره</p>
					<div className="center text-primary gap-1">
						<small className={"text-xs"}>{course._count.views}</small>
						<IconEye size={"1rem"}/>
					</div>
				</div>
				<div dangerouslySetInnerHTML={{__html: course.description}} className={'my-2'}></div>
				<Preview preview={course.preview}/>
				<br/>
				<a target={"_blank"} className={'w-full center'} href={AppConfig.contact.eitaa}>
					<Button className={'rounded-full'}>
						اطلاعات بیشتر (ارتباط با مدیر)
					</Button>
				</a>
				<br/>
				<p>شما با خرید این دوره به فایل های زیر دسترسی خواهید داشت!</p>
				<br/>
				<div className={'flex flex-col gap-2'}>
					{course.attachments?.map?.(att => (
						<div className={'center justify-between'}>
							<p>{att.name}</p>
							<Badge>{att.type}</Badge>
						</div>
					))}
				</div>
			</div>
			<p className={'text-center mt-2 text-gray-600 text-sm'}>
				تمام محتوای این برنامه متعلق به برنامه طب خیر می‌باشد. کپی‌برداری از آن پیگرد قانونی دارد.
			</p>
			<div className={'center justify-between bg-primary text-white fixed w-full bottom-[68px] z-10 left-0 p-2'}>
				<div>
					<h5>{!!course?.price ? course?.price?.toLocaleString('fa') + " تومان" : "رایگان"}</h5>
					<Text size={'sm'} lineClamp={1}>{course?.name}</Text>
				</div>
				<div className={'center gap-2'}>
					<div className={'center'}>
						<small>{course?._count?.likes}</small>
						<LikeButton course={course} liked={liked as any}/>
					</div>

					<CoursePaymentBtn disabled={alreadyBuy} user={await getUserFromCookie() as any} course={course} />
				</div>
			</div>
			<br/>
			<br/>
			<br/>
		</div>
	)
}

async function getCourse(props: any) {
	const id = props?.params?.id;
	return await prisma.course.findUnique({
		where: {
			id
		},
		include: {
			_count: {
				select: {
					likes: true,
					views: true
				}
			},
			attachments: {
				select: {
					name: true,
					type: true
				}
			}
		}
	});
}

export const generateMetadata = async (props: any) => {
	const course = await getCourse(props);
	return {
		title: course?.name
	}
}

export default Page;
