"use client";

import {Attachment, Course, UserCourse} from "@prisma/client";
import React, {useEffect, useRef, useState} from "react";
import {Badge, Button, Text} from "@mantine/core";
import {useRouter, useSearchParams} from "next/navigation";
import Loading from "@/app/(app)/loading";
import ZoomableImage from "@/app/(app)/app/dashboard/courses/[id]/ZoomableImage";
import ViewAttachment from "@/app/(app)/app/dashboard/courses/[id]/ViewAttachment";

const UserCourseView = (props: {
	userCourse: UserCourse,
	course: Course & { attachments: Attachment[] },
	token?: string
}) => {
	let {course} = props;
	const [target, setTarget] = useState<Attachment>();
	const search = useSearchParams()
	const router = useRouter();

	useEffect(() => {
		if (target?.id !== search.get('target')) setTarget(undefined)
	}, [search])

	useEffect(() => {
		if (target) {
			router.push(`?target=${target.id}`)
		}
	}, [target])

	return (
		<div className={'safe'}>
			{!target ? (
				<div className={'flex flex-col gap-2 p-3'}>
					{course.attachments?.map?.(att => (
						<div className={'rounded border p-2 center justify-between'}>
							<div className={'center justify-start gap-1 flex-grow'}>
								<Text lineClamp={1}>{att.name}</Text><Badge>{att.type}</Badge>
							</div>
							<Button size={'sm'} onClick={() => setTarget(att)}>
								مشاهده
							</Button>
						</div>
					))}
				</div>
			) : (
				<ViewAttachment attachment={{
					...target,
					link: target?.link+`?token=${props?.token}`
				}} />
			)}
		</div>
	)
}

export default UserCourseView;
