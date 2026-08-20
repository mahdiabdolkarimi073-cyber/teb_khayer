"use client";

import React from "react";
import {IconDashboard, IconGardenCart, IconPhotoVideo, IconUser} from "@tabler/icons-react";
import Link from "next/link";
import {usePathname} from "next/navigation";

const MobileNav = (props: any) => {
	const pathname = usePathname();
	const links = [
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
			name: "حساب کاربری من",
			link: "/dashboard",
			icon: IconUser
		}
	]

	return (
		<div className={'fixed bottom-0 left-0 center w-full pt-1 bg-primary text-white z-50'}>
			<div className={'w-full center justify-evenly p-2'}>
				{links.map( item => (
					<Link href={`/app${item.link}`} className={`flex flex-col items-center gap-1 ${pathname.startsWith(`/app${item.link}`) && 'border-b'}`}>
						<item.icon size={'1.8rem'} />
						<p className={"text-sm"}>{item.name}</p>
					</Link>
				))}
			</div>
		</div>
	)
}

export default MobileNav;
