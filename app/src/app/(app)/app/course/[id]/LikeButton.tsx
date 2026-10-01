"use client";
import {IconHeart, IconHeartFilled} from "@tabler/icons-react";
import {ActionIcon} from "@mantine/core";
import {Course, Like} from "@prisma/client";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {useRouter} from "next/navigation";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {useEffect} from "react";
import {handleCourseView} from "@/app/(app)/app/course/[id]/action";
import {__PAGE_LOAD} from "@/app/OverrideWindow";

const LikeButton = (props: {
	liked: Like | undefined,
	course: Course
}) => {
	const {liked, course}  = props;
	const router = useRouter();

	useEffect(()=>{
		handleCourseView(course);
	}, [])


	return (
		<ActionIcon
			onClick={async ()=>{
				const user = await getUserFromCookie();
				if (!user) {
					__PAGE_LOAD?.(true);
					router.push("/app/login");
					return;
				}
				if (liked) {
					await handlePrismaQuery("like", "delete", {
						where: {
							id: liked.id
						}
					});
				} else {
					await handlePrismaQuery("like", "create", {
						data: {
							userId: user?.id,
							courseId: course?.id
						}
					});
				}
				router.refresh();
			}}
			color={'#ff0052'}
			variant={'transparent'}>
			{liked ? <IconHeartFilled/> : <IconHeart/>}
		</ActionIcon>
	)
}

export default LikeButton;
