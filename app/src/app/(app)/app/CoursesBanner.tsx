import {IconClock} from "@tabler/icons-react";
import React from "react";
import Link from "next/link";

const CoursesBanner = (props: any) => {

	return (
		<Link href={'/app/courses'}
			 className={'h-[100px] flex-grow rounded-2xl overflow-hidden justify-start relative center text-white bg-gradient'}>
			<div className={'bg-gradient-to-tl shadow-inner from-black/30 to-black/0 absolute w-full h-full top-0 left-0'}></div>
			<div className={'center w-full p-1 relative z-10 gap-2'}>
				<div className={'center flex-col gap-1'}>
					<h2 className={'text-sm '}>دوره های آموزشی</h2>
					<p className={'text-xs'}>جهت مشاهده دوره کلیک کنید</p>
				</div>
			</div>
		</Link>
	)
}

export default CoursesBanner;
