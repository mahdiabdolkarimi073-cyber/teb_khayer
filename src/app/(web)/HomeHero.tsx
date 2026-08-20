"use client";

import { Image, Container, Title, Button, Group, Text, List, ThemeIcon, rem } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

import classes from './HeroBullets.module.css';
import AppConfig from "@/config/AppConfig";
import React from "react";
import Link from "next/link";
import AppDownloadBtn from "@/app/(web)/AppDownloadBtn";

export function HomeHero(props: any) {
	return (
		<Container size="md" id={'app'}>
			<div className={'center justify-start items-start lg:flex-nowrap flex-wrap'}>
				<div className={" mr-0"}>
					<Title className={classes.title}>
						اپلیکیشن{" "}
						{AppConfig.name} -
						با هدف
						{" "}
						<span className={classes.highlight}>آموزش
						جامع طب سنتی
							</span>
					</Title>
					<Text c="dimmed" mt="md">
						{props?.text || "دوره حجامت خشک و حجامت تر_دوره فصد_دوره کامل مزاج شناسی_دوره ماساژ درمانی_دوره آشنایی با اسکلت بدن_دوره آشنایی باعضلات بدن_آموزش هزارسوال وپاسخ آزمون مربی گری ماساژ_دوره زبان شناسی_دوره..."}
					</Text>

					<List
						mt={30}
						spacing="sm"
						size="sm"
						icon={
							<ThemeIcon size={20} radius="xl">
								<IconCheck style={{width: rem(12), height: rem(12)}} stroke={1.5}/>
							</ThemeIcon>
						}
					>
						<List.Item>
							<b>دوره های جامع</b> – دوره های کامل و مختصر از سرتاسر جهان
						</List.Item>
						<List.Item>
							<b>کمترین هزینه</b> – قیمت منصفانه نسبت به محتوای دوره
						</List.Item>
						<List.Item>
							<b>دسترسی سریع</b> – دسترسی سریع به دوره های خریداری شده از اپلیکیشن "طب خیر"
						</List.Item>
					</List>

					<Group mt={30}>
						<p className={'text-primary'}>جهت دسترسی به دوره ها لازم است اپلیکیشن "طب خیر" را نصب کنید</p>
						<AppDownloadBtn className={'rounded-full overflow-hidden'} radius={'xl'} size={'md'}  />
						<Link href={'/contact'}>
							<Button variant="default" radius="xl" size="md" className={classes.control}>
								ارتباط باما
							</Button>
						</Link>
					</Group>
				</div>
				<div>
					<Image src={'/design/home-slider.webp'} className={classes.image} />
					<AppDownloadBtn className={'rounded-full overflow-hidden'} radius={'xl'} size={'md'}  />
				</div>
			</div>
		</Container>
	);
}

export default HomeHero;
