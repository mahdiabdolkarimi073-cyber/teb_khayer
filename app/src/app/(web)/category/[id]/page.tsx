import prisma from "@backend/modules/prisma/Prisma";
import ProductCard from "@/app/(web)/ProductCard";
import {notFound} from "next/navigation";
import {Metadata} from "next";
import {getVar} from "@backend/utils/setting";
import {categoryMetadata} from "@/config/seo";
import {JsonLd, breadcrumbJsonLd} from "@/components/seo/JsonLd";

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
	const saleEnabled = (await getVar<string>("PRODUCTS_SALE_ENABLED")) !== "false";

	return (
		<>
			<JsonLd data={breadcrumbJsonLd([
				{name: "صفحه اصلی", url: "/"},
				{name: "دسته‌بندی‌ها", url: "/category/list"},
				{name: category.name, url: `/category/${category.id}`},
			])}/>
			<div className={'container mx-auto py-10'}>
				<h3>دسته بندی {category?.name}</h3>
				<div className={'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-2 gap-2'}>
					{category?.products?.map?.(p => <ProductCard product={p} saleEnabled={saleEnabled}/>)}
				</div>
			</div>
		</>
	)
}

export const generateMetadata = async (props: any): Promise<Metadata> => {
	const category = await prisma.productCategory.findUnique({
		where: {
			id: props?.params?.id
		}
	});
	if (!category) return {};
	return categoryMetadata(category);
}

export default Page;
