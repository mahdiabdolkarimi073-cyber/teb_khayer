import {Text, Container, ActionIcon, Group, rem, ThemeIcon, Anchor} from '@mantine/core';
import {IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconPhoneCall} from '@tabler/icons-react';

import classes from './FooterLinks.module.css';
import AppConfig from "@/config/AppConfig";
import Link from "next/link";
import React from "react";
import prisma from "@backend/modules/prisma/Prisma";
import {SocialsComponent} from "@/app/(web)/contact/socials";
import WebFooterEnamad from "@/app/(web)/WebFooter.enamad";
import {getVar} from "@backend/utils/setting";
import {SettingKeyInfo} from "@/generated/SettingKey.enum";



export async function WebFooter() {
	const categories = await prisma.productCategory.findMany({
		take: 4
	});
	const courses = await prisma.category.findMany({
		take: 4,
		where: {
			parentId: {
				equals: null
			}
		}
	});
	const phone = await getVar('MAIN_PHONE') || SettingKeyInfo["MAIN_PHONE"]?.default;

	const data = [
		{
			title: 'منو',
			links: [
				{label: 'خانه', link: '/'},
				{label: 'فروشگاه', link: '/category/all'},
				{label: 'دسته‌بندی‌ها', link: '/category/list'},
				{label: 'ارتباط باما', link: '/contact'},
				{label: 'پیگیری سفارشات', link: "/track"},
				{label: 'درباره ما', link: '/about'},
			],
		},
		{
			title: 'دسته بندی ها',
			links: categories.map(c => ({
				label: c?.name,
				link: `/category/${c?.id}`
			})),
		},
		{
			title: 'دوره ها',
			links: courses.map(c => ({
				label: c?.name,
				link: `/about#app`
			})),
		},
	];

	const groups = data.map((group) => {
		const links = group.links.map((link, index) => (
			<Text<'a'>
				key={index}
				className={classes.link}
				component="a"
				href={link.link}
			>
				{link.label}
			</Text>
		));

		return (
			<div className={classes.wrapper} key={group.title}>
				<Text className={classes.title}>{group.title}</Text>
				{links}
			</div>
		);
	});

	return (
		<footer className={classes.footer}>
			<Container className={classes.inner+" flex-wrap"}>
				<div className={classes.logo+" mb-3 md:mb-0"}>
					<Link href={'/'} className='block h-full'>
						<div className={'center h-full gap-2'}>
							<img loading='lazy' src={'/logo.webp'} alt={AppConfig.name} className={'h-[80px]'}/>
							<div>
								<h2 className={'text-2xl'}>{AppConfig.name}</h2>

							</div>
						</div>
					</Link>

				</div>
				<div className={classes.groups+" gap-2 md:gap-0"}>{groups}</div>
			</Container>
			<Container className={classes.afterFooter + " flex-wrap"}>
				<div>
					<Text c="dimmed" size="xs" className={'text-xs'}>
						© {new Date().toLocaleDateString('fa').split('/').shift()} {AppConfig.name}، تمامی حقوق
						محفوظ است.
					</Text>
					<a href={'https://novinbin.com'} target={"_blank"}
						// @ts-ignore
					   github={'https://github.com/fazelunity0054'} telegram={'@itzunity'}>
						<Text c="dimmed" size="xs" className={'text-xs'}>
							طراحی و پشتیبانی سایت مهندسی نوآوران نوین بین
						</Text>
					</a>
				</div>
				<div className={'center gap-2 flex-col'}>
					<Group gap={6} align="center">
						<ThemeIcon variant="light" color="blue" size="sm" radius="xl">
							<IconPhoneCall size="0.9rem" />
						</ThemeIcon>
						<Text size="xs" fw={500} c="dimmed">شماره تماس فروشگاه</Text>
					</Group>
					<Anchor href={`tel:${phone}`} c="blue" fw={700} size="lg" className="dir-ltr">
						{phone}
					</Anchor>
				</div>
				<div className={'h-[70px] w-fit'}>
					<WebFooterEnamad/>
				</div>
				<div className="center gap-2">
					<p>ارتباط باما</p>
					<SocialsComponent/>
				</div>
			</Container>
		</footer>
	);
}


export default WebFooter;
