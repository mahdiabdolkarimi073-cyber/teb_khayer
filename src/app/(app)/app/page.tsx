import React from "react";
import AppDateComponent from "@/app/(app)/app/AppDateComponent";
import AppMainBanner from "@/app/(app)/app/AppMainBanner";
import CoursesBanner from "@/app/(app)/app/CoursesBanner";
import EitaaBanner from "@/app/(app)/app/EitaaBanner";
import AppShopBanner from "@/app/(app)/app/AppShopBanner";
import {SocialsComponent} from "@/app/(web)/contact/socials";
import Taghvims from "@/app/(web)/Taghvims";
import Link from "next/link";

const Page = (props: any) => {

	return (
		<div className={'p-4 flex flex-col gap-2'}>
			<AppDateComponent/>
			<AppMainBanner/>

			<Banner title={'تشخیص بیماری ها از روی زبان'} className={'from-sky-500 to-teal-500'} description={'جهت ارسال عکس زبان کلیک کنید'}
				   link={'/app/service/IDENTIFY'}/>
			<div className={'grid grid-cols-2 gap-3'}>
				<Banner title={'تفسیر برگه آزمایش تفسیر سونوگرافی'} className={'from-emerald-500 to-teal-500'} description={'جهت  تفسیر کلیک کنید'} link={'/app/service/EXPLAIN'} />
				<Banner title={'وزیزیت انلاین'} className={' from-cyan-400 to-cyan-600'} description={'جهت مشاوره کلیک کنید'} link={'/app/service/VISIT'} />
			</div>
			<EitaaBanner/>
			<div className={'grid grid-cols-2 gap-3'}>
				<CoursesBanner/>
				<AppShopBanner/>
			</div>
			<Taghvims application/>
			<div className={'center gap-2 '}>
				<p>ارتباط باما</p>
				<SocialsComponent/>
			</div>
		</div>
	)
}

export function Banner(props: {
	title: string,
	description: string,
	link: string,
	className?: string
}) {
	let {description, link, title} = props;

	return (
		<Link href={link}
			 className={'h-[100px] flex-grow rounded-2xl overflow-hidden justify-start relative center text-white'}>
			<div className={`bg-gradient-to-tl shadow-inner ${props.className || "from-black/30 to-black/0"} absolute w-full h-full top-0 left-0`}></div>
			<div className={'center w-full p-1 relative z-10 gap-2'}>
				<div className={'center flex-col gap-1'}>
					<h2 className={'text-sm text-center'}>{title}</h2>
					<p className={'text-xs text-center'}>{description}</p>
				</div>
			</div>
		</Link>
	)
}

export default Page;
