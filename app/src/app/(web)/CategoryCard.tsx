import { Paper, Text, Title, Button } from '@mantine/core';
import classes from './ArticleCardImage.module.css';
import {ProductCategory} from "@prisma/client";
import React from "react";
import Link from "next/link";

export function CategoryCard(props: {category: ProductCategory}) {
	let {category} = props;
	let {created_at, id, name, parentId, thumbnail} = category;

	return (
		<Link href={`/category/${id}`}>
			<Paper shadow="md" p="sm" radius="md" className={classes.card} style={{
				backgroundImage: `url(${thumbnail})`
			}}>
				<div className={'relative z-10'}>
					<Text className={classes.category} size="xs">
						دسته بندی
					</Text>
					<Title order={3} className={classes.title}>
						{name}
					</Title>
				</div>
				<Button variant="white" color="dark">
					مشاهده محصولات
				</Button>
			</Paper>
		</Link>
	);
}

export default CategoryCard;
