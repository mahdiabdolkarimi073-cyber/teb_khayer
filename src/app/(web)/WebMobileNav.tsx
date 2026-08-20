'use client';

import {IconCategory, IconGardenCart, IconHome, IconPhotoVideo, IconShoppingCart, IconUser} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import {usePathname} from "next/navigation";
import {_openCart} from "@/app/(web)/WebHeader";

const WebMobileNav = (props: any) => {

	const pathname = usePathname();

	const links = [
		{
			name: "خانه",
			link: "/",
			icon: IconHome
		},
		{
			name: "دسته بندی ها",
			link: "/category",
			icon: IconCategory
		},
		{
			name: "سبد خرید من",
			link: ()=>_openCart(),
			icon: IconShoppingCart
		},
		{
			name: "حساب کاربری من",
			link: "/dashboard/checkout",
			icon: IconUser
		}
	]

	return (
		<div className={'center justify-evenly p-2 bg-white shadow'}>
			{links.map( item => (
				<Link onClick={(e)=>{
					if (typeof item.link === 'function') {
						e.stopPropagation();
						e.preventDefault();
						item?.link?.();
						return false;
					}
				}} href={item.link+""} className={`flex flex-col items-center gap-1 ${pathname === item.link && 'border-b border-primary'}`}>
					<item.icon size={'1.8rem'} className={'text-primary'} />
					<p className={"text-sm"}>{item.name}</p>
				</Link>
			))}
		</div>
	)
}

export default WebMobileNav;
