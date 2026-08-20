"use client";
import AppConfig from "@/config/AppConfig";
import React, {useEffect, useState} from "react";
import BurgerMenu from "@/app/(app)/BurgerMenu";
import {IconChevronLeft, IconHelpHexagon, IconLifebuoy} from "@tabler/icons-react";
import {usePathname, useRouter} from "next/navigation";
import {ActionIcon, Text} from "@mantine/core";
import {useDocumentTitle} from "@mantine/hooks";

const AppHeader = (props: any) => {
	const [title, setTitle] = useState(AppConfig.name)
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		setTitle(document.title);
	}, [pathname]);

	return (
		<div className={'bg-primary sticky top-0 left-0 text-white p-3 center w-full justify-between z-50'}>
			<div className={'center gap-2'}>
				<BurgerMenu />
				<Text lineClamp={1} className={'font-normal'} size={'xl'}>{pathname === "/app" ? AppConfig.name:title}</Text>
			</div>
			{pathname === "/app" ? (
				<a target={'_blank'} href={AppConfig.contact.eitaa}>
					<IconHelpHexagon size={'2rem'}/>
				</a>
			):(
				<ActionIcon data-changer onClick={()=>{
					router.back();
				}} size={'lg'}>
					<IconChevronLeft size={'5rem'} />
				</ActionIcon>
			)}
		</div>
	)
}

export default AppHeader;
