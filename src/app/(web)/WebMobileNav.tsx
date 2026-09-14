'use client';

import {IconCategory, IconGardenCart, IconHome, IconShoppingCart, IconUser, IconList, IconTruckDelivery} from "@tabler/icons-react";
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
			name: "دسته‌ها",
			link: "/category/list",
			icon: IconCategory
		},
		{
			name: "فروشگاه",
			link: "/category/all",
			icon: IconList
		},
		{
			name: "سبد",
			link: ()=>_openCart(),
			icon: IconShoppingCart
		},
		{
			name: "پیگیری",
			link: "/track",
			icon: IconTruckDelivery
		},
		{
			name: "حساب من",
			link: "/dashboard/checkout",
			icon: IconUser
		}
	];

	return (
		<div className={'center justify-evenly p-1 bg-white shadow-lg border-t border-gray-200'}>
			{links.map( item => (
				<Link onClick={(e)=>{
					if (typeof item.link === 'function') {
						e.stopPropagation();
						e.preventDefault();
						item?.link?.();
						return false;
					}
				}} href={item.link+""} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${pathname === item.link ? 'text-primary bg-blue-50' : 'text-gray-600'}`}>
					<item.icon size={'1.5rem'} className={pathname === item.link ? 'text-primary' : 'text-gray-500'} />
					<p className={"text-[10px]"}>{item.name}</p>
				</Link>
			))}
		</div>
	)
}

export default WebMobileNav;
