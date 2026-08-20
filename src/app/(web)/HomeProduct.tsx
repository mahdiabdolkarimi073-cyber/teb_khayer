
import prisma from "@backend/modules/prisma/Prisma";
import ProductCard from "@/app/(web)/ProductCard";
import {IconChevronLeft, IconSparkles, IconStars, IconStarsFilled} from "@tabler/icons-react";
import React from "react";
import {Button} from "@mantine/core";
import Link from "next/link";

const HomeProduct = async (props: any) => {
	const products = await prisma.product.findMany({
		take: 8,
		include: {
			category: true
		}
	});

	return (
		<div className={'container mx-auto p-2 lg:p-0'}>
			<div className={'center justify-between'}>
				<div className="center gap-2">
					<IconSparkles size={'2rem'} className={'text-primary'} />
					<h3>اخرین محصولات</h3>
				</div>
				<Link href={'/category/all'}>
					<Button size={'md'} rightSection={<IconChevronLeft size={'1.2rem'} />} className={'rounded-full'}>
						محصولات
					</Button>
				</Link>
			</div>
			<br/>
			<div className={'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-2 gap-2'}>
				{products?.map?.(p => <ProductCard product={p} />)}
			</div>
		</div>
	)
}

export default HomeProduct;
