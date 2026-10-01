import CategoryCard from "@/app/(web)/CategoryCard";
import prisma from "@backend/modules/prisma/Prisma";

const Page = async (props: any) => {

	const categories = await prisma.productCategory.findMany();

	return (
		<div className={'container mx-auto p-2 md:p-0'}>
			<div className={'center justify-start flex-wrap p-2'}>
				{categories?.map(cat => (
					<div className={'w-1/2 p-2 sm:w-1/3 lg:w-1/4'}>
						<CategoryCard category={cat}/>
					</div>
				))}
			</div>
		</div>
	)
}

export default Page;
