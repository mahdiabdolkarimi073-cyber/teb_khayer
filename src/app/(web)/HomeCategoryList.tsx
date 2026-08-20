import prisma from "@backend/modules/prisma/Prisma";
import CategoryCard from "@/app/(web)/CategoryCard";
import {IconChevronLeft, IconSparkles} from "@tabler/icons-react";
import Link from "next/link";
import {Button} from "@mantine/core";
import React from "react";

const HomeCategoryList = async (props: any) => {
	let categories = await prisma.productCategory.findMany({
		include: {
			products: {
				select: {
					id: true
				}
			}
		}
	});

	categories = categories.filter(c => c.products?.length > 0)?.slice?.(0,8);

	return (
		<div className={'container mx-auto p-2 lg:p-0'}>
			<div className={'center justify-between'}>
				<div className="center gap-2">
					<IconSparkles size={'2rem'} className={'text-primary'}/>
					<h3>دسته بندی ها</h3>
				</div>
				<Link href={'/category/list'}>
					<Button size={'xs'} rightSection={<IconChevronLeft size={'1rem'}/>} className={'rounded-full'}>
						مشاهده همه
					</Button>
				</Link>
			</div>
			<br/>
			<div className={'grid grid-cols-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'}>
				{categories.map(c => <CategoryCard category={c}/>)}
			</div>
		</div>
	)
}

export default HomeCategoryList;
