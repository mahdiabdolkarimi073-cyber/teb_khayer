"use client";

import {Course, Prisma, User} from "@prisma/client";
import React from "react";
import {Button} from "@mantine/core";
import {useRouter} from "next/navigation";
import {createPortalForCourse} from "@backend/modules/payment/action";
import {__PAGE_LOAD} from "@/app/OverrideWindow";
import {generateRandomString} from "@backend/utils/string";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import UserCourseCreateArgs = Prisma.UserCourseCreateArgs;

declare global {
	var ReactNativeWebView: {
		postMessage(msg: string): void;
	};
}

let RNATIVE_EVENT: {
	[key: string]: (r: any) => void
}

if (typeof window !== 'undefined') {
	window.onmessage = (e) => {
		let str = e as any;
		str = JSON.parse(decodeURIComponent(str));
		const data = JSON.parse(str);
		RNATIVE_EVENT?.[data.nativeRequestId]?.(data);
	}
}

export function sendReactNativeData(data: any, callback: (r: {
	error: boolean,
	response: any,
	[key: string]: any
}) => void) {
	const id = generateRandomString();
	RNATIVE_EVENT ||= {};
	RNATIVE_EVENT[id] = callback;
	window.ReactNativeWebView.postMessage(JSON.stringify({
		...data,
		nativeRequestId: id
	}));

}

const CoursePaymentBtn = (props: {
	course: Course,
	user?: User,
	disabled?: boolean
}) => {
	const router = useRouter();

	async function onSuccess() {
		const query: UserCourseCreateArgs = {
			data: {
				userId: props.user?.id + "",
				courseId: props.course.id + ""
			}
		}
		await handlePrismaQuery("userCourse", 'create', query)
		alert("پرداخت باموفقیت انجام شد!")
		router.refresh();
	}

	return (
		<Button onClick={async () => {


			if (!props.user) router.push(`/app/login?redirect=${window.location.pathname}`);
			else {
				__PAGE_LOAD(true);
				if (props.disabled) {
					router.push(`/app/dashboard/courses`)
				} else {
					if (window.ReactNativeWebView && window.appType !== 'other') {
						if (props.course.price <= 0) {
							onSuccess().catch(console.error);
							return;
						}

						sendReactNativeData({
							type: "course",
							id: props.course.id,
							userId: props.user.id
						}, async (r) => {
							__PAGE_LOAD(false);
							if (r.error) {
								alert("خطا در پرداخت!");
							} else {
								onSuccess().catch(console.error);
							}
						})
					} else {
						const token = await createPortalForCourse(props.course)
						__PAGE_LOAD(false);

						if (token === "FREE") {
							alert("دوره باموفقیت فعال شد")
							router.push(`/app/dashboard/courses`);
							return;
						}

						window.doPayment(token)
					}
				}
			}
		}} type='submit' color={'green'}>
			{props.disabled ? "مشاهده" : "پرداخت"}
		</Button>
	)
}

export default CoursePaymentBtn;
