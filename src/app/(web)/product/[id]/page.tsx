import prisma from "@backend/modules/prisma/Prisma";
import {notFound} from "next/navigation";
import React from "react";
import ProductView from "@/app/(web)/product/[id]/ProductView";
import {Metadata} from "next";
import {getVar} from "@backend/utils/setting";
import {productMetadata} from "@/config/seo";
import {JsonLd, productJsonLd, breadcrumbJsonLd} from "@/components/seo/JsonLd";

const Page = async (props: {
	params?: Promise<{ id?: string }> | { id?: string };
}) => {
	const resolvedParams = props?.params ? await Promise.resolve(props.params) : {};
	const rawId = resolvedParams?.id || "";
	const cleanId = typeof rawId === "string" ? decodeURIComponent(rawId).split("?")[0].trim() : rawId;
	const product = await prisma.product.findUnique({
		where: {
			id: cleanId
		},
		include: {
			category: {
				include: {
					products: {
						take: 8
					}
				}
			}
		}
	});

	if (!product) {
		notFound();
		return;
	}

	const saleEnabled = (await getVar<string>("PRODUCTS_SALE_ENABLED")) !== "false";

	return (
		<>
			<JsonLd data={productJsonLd(product)}/>
			<JsonLd data={breadcrumbJsonLd([
				{name: "صفحه اصلی", url: "/"},
				{name: product.category?.name || "محصولات", url: `/category/${product.categoryId}`},
				{name: product.name, url: `/product/${product.id}`},
			])}/>
			<ProductView product={product} saleEnabled={saleEnabled}/>
		</>
	)
}

export const generateMetadata = async (props: {
	params?: Promise<{ id?: string }> | { id?: string };
}): Promise<Metadata> => {
	const resolvedParams = props?.params ? await Promise.resolve(props.params) : {};
	const rawId = resolvedParams?.id || "";
	const cleanId = typeof rawId === "string" ? decodeURIComponent(rawId).split("?")[0].trim() : rawId;
	const product = await prisma.product.findUnique({
		where: {
			id: cleanId
		}
	});
	if (!product) return {};
	return productMetadata(product);
}

export const dynamic = 'force-dynamic'

export default Page;
