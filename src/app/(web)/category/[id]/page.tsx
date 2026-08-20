import prisma from "@backend/modules/prisma/Prisma";
import ProductCard from "@/app/(web)/ProductCard";
import {notFound} from "next/navigation";
import {Metadata} from "next";

const Page = async (props: any) => {
	const category = await prisma.productCategory.findUnique({
		where: {
			id: props?.params?.id
		},
		include: {
			products: {
				orderBy: {
					created_at: "asc"
				}
			}
		}
	});
	if (!category) {
		notFound();
		return;
	}

	return (
		<div className={'container mx-auto py-10'}>
			<h3>دسته بندی {category?.name}</h3>
			<div className={'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-2 gap-2'}>
				{category?.products?.map?.(p => <ProductCard product={p}/>)}
			</div>
		</div>
	)
}

export const generateMetadata = async (props: any) => {
	const category = await prisma.productCategory.findUnique({
		where: {
			id: props?.params?.id
		}
	});
	if (!category) return {};


	return {
		title: category.name,
		keywords: category.name.split(" ")
	} as Metadata
}

export default Page;
