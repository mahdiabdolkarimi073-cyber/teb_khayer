"use client";

import {Badge, Button, Card, Group, Text} from '@mantine/core';
import classes from './BadgeCard.module.css';
import {Product, ProductCategory} from "@prisma/client";
import React from "react";
import Link from "next/link";
import ProductLike from "@/components/shop/ProductLike";
import {ProductImage} from "@/components/shop/ProductImage";


export function ProductCard(props: { product: Product & { category?: ProductCategory }, footer?: any, saleEnabled?: boolean }) {
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
	const outOfStock = (props.saleEnabled === false) || !stock || stock <= 0;
	const image = images?.[0] || "/empty.png";
	const features = properties?.split("\n")?.map(line => ({label: line?.split(":")?.pop(), emoji: ""}))?.slice(0, 3).filter(n => !!n.label) || [];

	return (
		<Card withBorder radius="md" p="md" pt={0} className={classes.card + " justify-between relative"}>
			{outOfStock && (
				<div className={'absolute left-0 top-0 p-4 z-10'}>
					<Badge color={'red'} size={'xl'}>ناموجود</Badge>
				</div>
			)}
			<div>
				<Card.Section className={'relative'}>
					<div className={'absolute right-0 bottom-0 p-2 z-10'}>
						<Badge size={'lg'}>{price.toLocaleString('fa')} تومان</Badge>
					</div>
					<ProductImage
						src={image}
						alt={name1}
						aspectRatio="1/1"
						size="card"
					/>
				</Card.Section>

				<Card.Section className={classes.section} mt="md">
					<div className={' w-full'}>
						<Text fz="md" lineClamp={1} fw={500} className={'flex-grow'}>
							{name1}
						</Text>
						<div className={'hidden sm:block flex-grow-0 overflow-hidden center justify-end w-full text-left'}>
							<Badge size="xs" variant="light" className={'text-wrap overflow-auto text-left'}>
								{category?.name}
							</Badge>
						</div>
					</div>
					<Text lineClamp={3} fz="sm" mt="xs" className={'text-balance'}>
						{description_text}
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
