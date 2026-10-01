import prisma from "@backend/modules/prisma/Prisma";
import React from "react";
import Link from "next/link";
import {Course, User} from "@prisma/client";

const Page = async () => {
	const userCourses = await prisma.userCourse.findMany({
		include: {
			course: true,
			user: true
		}
	});

	const users = userCourses.reduce((total, item) => {
		const pre = total[item.user.id] || {
			courses: [],
			user: item.user,
			totalPrice: 0
		};
		if (pre.courses.find(c => c.id === item.course.id)) return total;

		total[item.user.id] = {
			...pre || {},
			user: item.user,
			courses: [
				...pre?.courses || [],
				item.course
			],
			totalPrice: pre.totalPrice + item.course.price
		}

		return total;
	}, {} as {
		[key: string]: {
			user: User,
			courses: Course[],
			totalPrice: number
		}
	})

	return (
		<div className={'p-2'}>
			<h2>دانشجویان ({Object.keys(users).length})</h2>
			{Object.entries(users).map(([id, st]) => (
				<details className={'center justify-between rounded my-2 p-2 border'}>
					<summary>
						{st.user.name} ({st.user.phone}) [{st.totalPrice.toLocaleString('fa')} تومان]
					</summary>
					<div className={'flex flex-col gap-1'}>
						{st.courses.map(c => (
							<Link href={`./courses/${c.id}`} className={'center justify-start gap-2'}>
								<img src={c.thumbnail} style={{width: "30px", height: "30px"}}
									className={'rounded-full'}/>
								<p className={'text-gray-700 text-xs'}>{c.name} ({c.price?.toLocaleString('fa')} تومان)</p>
							</Link>
						))}
					</div>
				</details>
			))}
		</div>
	);
};

export default Page;
