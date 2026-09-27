import {Text, Container, ActionIcon, rem, ThemeIcon, Anchor} from '@mantine/core';
import {IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconPhoneCall} from '@tabler/icons-react';

import classes from './FooterLinks.module.css';
import AppConfig from "@/config/AppConfig";
import Link from "next/link";
import React from "react";
import prisma from "@backend/modules/prisma/Prisma";
import {SocialsComponent} from "@/app/(web)/contact/socials";
import WebFooterEnamad from "@/app/(web)/WebFooter.enamad";
import TorobBadge from "@/app/(web)/TorobBadge";
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
	const basalamLink = await getVar<string>('BASALAM_LINK');

	const contactOverride: Record<string, string> = { ...AppConfig.contact };
	if (basalamLink) {
		contactOverride["basalam"] = basalamLink;
	}

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
			<div className={classes.waveTop} aria-hidden="true">
				<svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={classes.waveSvg}>
					<path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#082b54" className={classes.wavePath1}/>
					<path d="M0,50 C240,20 480,70 720,40 C960,10 1200,60 1440,40 L1440,80 L0,80 Z" fill="#0a3a6e" className={classes.wavePath2} opacity="0.5"/>
				</svg>
			</div>
			<Container className={classes.inner}>
				<div className={classes.logo}>
					<Link href={'/'} className='block h-full'>
						<div className={'center h-full gap-2'}>
							<img loading='lazy' src={'/logo.webp'} alt={AppConfig.name} className={'h-[80px]'}/>
							<div>
								<h2 className={classes.brandTitle}>{AppConfig.name}</h2>

							</div>
						</div>
					</Link>

				</div>
				<div className={classes.groups}>{groups}</div>
			</Container>
			<Container className={classes.afterFooter}>
				<div className={classes.footerLegal}>
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
				<div className={classes.footerContact}>
					<div className="center gap-2 flex-nowrap">
						<ThemeIcon variant="light" color="blue" size="sm" radius="xl">
							<IconPhoneCall size="0.9rem" />
						</ThemeIcon>
						<Text size="xs" fw={500} c="dimmed">شماره تماس فروشگاه</Text>
					</div>
					<Anchor href={`tel:${phone}`} c="blue" fw={700} size="lg" className="dir-ltr">
						{phone}
					</Anchor>
				</div>
				<div className={classes.trustBadge + ' h-[70px] w-fit'}>
					<WebFooterEnamad/>
					<TorobBadge/>
				</div>
				<div className={classes.footerSocials + " center gap-2"}>
					<p className="mb-1">ارتباط باما</p>
					<SocialsComponent contactOverride={contactOverride}/>
				</div>
			</Container>
		</footer>
	);
}


export default WebFooter;
