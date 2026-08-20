"use client";

import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { Paper, Text, Title, Button, useMantineTheme, rem } from '@mantine/core';
import classes from './CardsCarousel.module.css';
import '@mantine/carousel/styles.css';
import {Category, ProductCategory} from "@prisma/client";
import React from "react";
import Link from "next/link";

interface CardProps {
	image: string;
	title: string;
	category: string;
}

function Card({ image, title, category }: CardProps) {
	return (
		<Paper
			shadow="md"
			p="xl"
			radius="md"
			style={{ backgroundImage: `url(${image})` }}
			className={classes.card}
		>
			<div className={'z-10 relative'}>
				<Text className={classes.category} size="xs">
					{category}
				</Text>
				<Title order={3} className={classes.title}>
					{title}
				</Title>
			</div>
			<Button variant="white" color="dark">
				مشاهده دوره
			</Button>
		</Paper>
	);
}



export function HomeCarousel(props: {categories: Category[] | ProductCategory[]}) {
	const data =props?.categories?.map(c => ({
		image: c?.thumbnail,
		title: c?.name,
		category: "دوره"
	}));

	const theme = useMantineTheme();
	const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
	const slides = data.map((item) => (
		<Carousel.Slide key={item.title}>
			<Link href={'#app'}>
				<Card {...item} />
			</Link>
		</Carousel.Slide>
	));

	return (
		<div className={'relative w-full'}>
			<Carousel
				slideSize={{ base: '100%', sm: '50%' }}
				slideGap={{ base: rem(2), sm: 'xl' }}
				align="start"
				slidesToScroll={2}
			>
				{slides}
			</Carousel>
		</div>
	);
}

export default HomeCarousel;
