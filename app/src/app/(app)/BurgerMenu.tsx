"use client";
import React, {useEffect} from "react";
import {useDisclosure} from "@mantine/hooks";
import {Burger, Drawer, NavLink} from "@mantine/core";
import {usePathname} from "next/navigation";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {useAction} from "@/utils/server";
import {User} from "@prisma/client";
import AppConfig from "@/config/AppConfig";
import {IconChevronRight, IconHome, IconPhone, IconStars, IconUser, IconPhotoVideo} from "@tabler/icons-react";
import Link from "next/link";


const BurgerMenu = (props: any) => {
	const [opened, { toggle, close }] = useDisclosure(false);
	const {result: user} = useAction(getUserFromCookie);
	const label = opened ? 'Close navigation' : 'Open navigation';
	const pathname = usePathname();

	useEffect(() => {
		close();
	}, [pathname]);

	const AppHeaderLinks = [
		{
			href: !!user ? "/dashboard":"/login",
			name: !!user ? "داشبورد":"ورود یا ثبت نام",
			icon: IconUser
		},
		{
			href: "/",
			name: "صفحه اصلی",
			icon: IconHome
		},
		{
			href: "/shop",
			name: "فروشگاه",
			icon: IconStars
		},
		{
			href: "/courses",
			name: "دوره ها",
			icon: IconPhotoVideo
		},
		{
			href: "/contact",
			name: "ارتباط باما",
			icon: IconPhone
		}
	]

	return (
		<>
			<Burger opened={opened} onClick={toggle} aria-label={label} color={'white'} />
			<Drawer size={'85%'} opened={opened} onClose={close} title={AppConfig.name}>
				<div className={'flex flex-col gap-2'}>
					{AppHeaderLinks.map(item => (
						<NavLink
							key={item?.href}
							component={Link}
							href={"/app"+item.href}
							onClick={close}
							label={item.name}
							className={'rounded'}
							leftSection={<item.icon className={`text-primary  ${pathname === "/app"+item.href ? "text-white":""}`} size="1.3rem" stroke={1.5} />}
							rightSection={
								<IconChevronRight size="0.8rem" stroke={1.5} className={`mantine-rotate-rtl`} />
							}
							variant={pathname.startsWith("/app"+item.href) ? "filled":"subtle"}
							active={pathname === "/app"+item.href}
						/>
					))}
				</div>
			</Drawer>
		</>
	);
}

export default BurgerMenu;
