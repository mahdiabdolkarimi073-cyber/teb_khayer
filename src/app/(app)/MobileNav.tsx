"use client";

import React from "react";
import {IconHome, IconGardenCart, IconPhotoVideo, IconUser} from "@tabler/icons-react";
import Link from "next/link";
import {usePathname} from "next/navigation";

const MobileNav = (props: any) => {
	const pathname = usePathname();
	const links = [
		{
			name: "خانه",
			link: "/",
			icon: IconHome
		},
		{
			name: "فروشگاه",
			link: "/shop",
			icon: IconGardenCart
		},
		{
			name: "دوره ها",
			link: "/courses",
			icon: IconPhotoVideo
		},
		{
			name: "حساب کاربری",
			link: "/dashboard",
			icon: IconUser
		}
	];

	return (
		<div className={'fixed bottom-0 left-0 center w-full pt-1 bg-primary text-white z-50'}>
			<div className={'w-full center justify-evenly p-2'}>
				{links.map( item => (
					<Link href={`/app${item.link}`} className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${pathname.startsWith(`/app${item.link}`) ? 'bg-white/20' : ''}`}>
						<item.icon size={'1.6rem'} />
						<p className={"text-xs"}>{item.name}</p>
					</Link>
				))}
			</div>
		</div>
	);
}

export default MobileNav;
