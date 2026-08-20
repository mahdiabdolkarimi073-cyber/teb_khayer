"use client";

import {ActionIcon, Group, rem} from "@mantine/core";
import React from "react";
import AppConfig from "@/config/AppConfig";
import classes from '../FooterLinks.module.css';
import Link from "next/link";

const socials = {
	WECHAT: (props: any) => (
		<svg
			aria-describedby="desc"
			aria-labelledby="title"
			role="img"
			viewBox="0 0 64 64"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			{...props}
		>
			<path
				d="M64 43.1c0-9.4-8.9-17-20-17-11 0-20 7.6-20 17s8.9 17 20 17a23.272 23.272 0 0 0 9.6-2.1l7.9 3.4-.9-8.8a15.526 15.526 0 0 0 3.4-9.5zm-26.7-4.6a2.8 2.8 0 1 1 2.8-2.8 2.734 2.734 0 0 1-2.8 2.8zm13.5 0a2.8 2.8 0 1 1 2.8-2.8 2.8 2.8 0 0 1-2.8 2.8z"
				data-name="layer1"
				fill="#2dc100"
			/>
			<path
				d="M44 23.9a27.375 27.375 0 0 1 8.7 1.5c0-.4.1-.7.1-1.1C52.8 12 41 2 26.4 2S0 12 0 24.4A20.408 20.408 0 0 0 4.5 37L3.3 48.6l10.4-4.5a29.1 29.1 0 0 0 8.4 2.4 18.61 18.61 0 0 1-.4-3.4c.1-10.6 10.1-19.2 22.3-19.2zm-8.7-13.1a3.8 3.8 0 1 1-3.8 3.8 3.8 3.8 0 0 1 3.8-3.8zm-17.8 7.5a3.714 3.714 0 0 1-3.7-3.8 3.75 3.75 0 1 1 3.7 3.8z"
				data-name="layer1"
				fill="#2dc100"
			/>
		</svg>
	),
	GMAIL: (props: any) => (
		<img loading={'lazy'} src={'/icons/gmail.webp'} alt={'GMAIL'} {...props} />

	),
	INSTAGRAM: (props: any) => (
		<img loading={'lazy'} src={'/icons/ins.webp'} alt={'INSTAGRAM'} {...props} />
	),
	WHATSAPP: (props: any) => (
		<img loading={'lazy'} src={'/icons/whatsapp.webp'} alt={'WHATSAPP'} {...props} />
	),
	TELEGRAM: (props: any) => (
		<img loading={'lazy'} src={'/icons/telegram.webp'} alt={'TELEGRAM'} {...props} />
	),
	FACEBOOK: (props: any) => (
		<img loading={'lazy'} src={'/icons/facebook.webp'} alt={'FACEBOOK'} {...props} />
	),
	TWITTER: (props: any) => (
		<img loading={'lazy'} src={'/icons/x.webp'} alt={'TWITTER'} {...props} />
	),
	RUBIKA: (props: any) => (
		<img loading={'lazy'} src={'/icons/rubika.webp'} alt={'RUBIKA'} {...props} />
	),
	EITAA: (props: any) => (
		<img loading={'lazy'} src={'/banners/eitaa.webp'} alt={'EITAA'} {...props} />
	)
}

export const socialsNames = {
	"WECHAT": "وی‌چت",
	"GMAIL": "جی‌میل",
	"INSTAGRAM": "اینستاگرام",
	"WHATSAPP": "واتس‌اپ",
	"TELEGRAM": "تلگرام",
	"FACEBOOK": "فیس‌بوک",
	"TWITTER": "توییتر",
	"RUBIKA": "روبیکا",
	"EITAA": "ایتا"
}


export function SocialIcon(props: {social: string, [key: string | symbol]: any}) {
	let {social: key} = props;
	key = key?.toUpperCase?.();
	const Icon = socials[key as keyof typeof socials] ?? socials?.WECHAT;


	return (
		<ActionIcon size="lg" color="gray" variant="subtle">
			<Icon  className={"object-contain"}
				 stroke={1.5} {...props} style={{width: rem(18), height: rem(18), ...(props?.style || {})}} />
		</ActionIcon>
	);
}

export const SocialsComponent = () => {
	return (
		<Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
			{Object.entries(AppConfig.contact).map(([key, link]) => {
				return (
					<a target={'_blank'} href={link}>
						<SocialIcon social={key}  />
					</a>
				);
			})}
		</Group>
	)
}

export default socials;
