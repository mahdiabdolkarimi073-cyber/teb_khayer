"use client";

import {Badge, Button, Card, Group, Image, Text} from '@mantine/core';
import classes from './BadgeCard.module.css';
import {Product, ProductCategory} from "@prisma/client";
import React from "react";
import Link from "next/link";
import ProductLike from "@/components/shop/ProductLike";


export function ProductCard(props: { product: Product & { category?: ProductCategory }, footer?: any }) {
	let {
		category,
		categoryId,
		created_at: created_at1,
		description: description1,
		description_text,
		id: id1,
		images,
		name: name1,
		price,
		properties,
		updated_at,
		stock
	} = props.product;
	const mockdata = {
		image: images[0],
		title: name1,
		country: category?.name,
		description: description_text,
		badges: properties?.split("\n")?.map(line => ({label: line?.split(":")?.pop(), emoji: ""})),
	};

	const {image, title, description, country, badges} = mockdata;
	const features = badges?.slice?.(0, 3).filter(n => !!n.label).map((badge) => (
		<Badge variant="light" size={'xs'} key={badge.label} leftSection={badge.emoji}>
			{badge.label}
		</Badge>
	));

	return (
		<Card withBorder radius="md" p="md" pt={0} className={classes.card + " justify-between relative"}>
			{stock <= 0 && (
				<div className={'absolute left-0 top-0 p-4 z-10'}>
					<Badge color={'red'} size={'xl'}>ناموجود</Badge>
				</div>
			)}
			<div>
				<Card.Section className={'relative'}>
					<div className={'absolute right-0 bottom-0 p-2 z-10'}>
						<Badge size={'lg'}>{price.toLocaleString('fa')} تومان</Badge>
					</div>
					<Image src={image} alt={title} className={'object-cover h-[150px] sm:h-[220px]'}/>
				</Card.Section>

				<Card.Section className={classes.section} mt="md">
					<div className={' w-full'}>
						<Text fz="md" lineClamp={1} fw={500} className={'flex-grow'}>
							{title}
						</Text>
						<div className={'hidden sm:block flex-grow-0 overflow-hidden center justify-end w-full text-left'}>
							<Badge size="xs" variant="light" className={'text-wrap overflow-auto text-left'}>
								{country}
							</Badge>
						</div>
					</div>
					<Text lineClamp={3} fz="sm" mt="xs" className={'text-balance'}>
						{description}
					</Text>
				</Card.Section>
			</div>

			<div>


				{props?.footer || (
					<div className={'center gap-1'}>
						<Link href={`/product/${id1}`} className={'flex-grow'}>
							<Button radius="md" size={'xs'} fullWidth>
								مشاهده محصول
							</Button>
						</Link>
						<ProductLike id={id1}/>
					</div>
				)}
			</div>
		</Card>
	);
}

export default ProductCard;
