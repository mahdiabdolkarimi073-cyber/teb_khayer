import prisma from "@backend/modules/prisma/Prisma";
import {IconSparkles} from "@tabler/icons-react";
import CategoryCard from "@/app/(web)/CategoryCard";
import React from "react";

const Page = async (props: any) => {
	let categories = await prisma.productCategory.findMany({
		include: {
			products: true
		}
	});

	categories = categories.filter(c => c.products?.length > 0);

	return (
		<div className={'container mx-auto p-2 lg:p-0 my-10'}>
			<div className={'center justify-between'}>
				<div className="center gap-2">
					<IconSparkles size={'2rem'} className={'text-primary'}/>
					<h3>تمام دسته بندی ها</h3>
				</div>
			</div>
			<br/>
			<div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'}>
				{categories.map(c => <CategoryCard category={c}/>)}
			</div>
		</div>
	)
}

export default Page;
