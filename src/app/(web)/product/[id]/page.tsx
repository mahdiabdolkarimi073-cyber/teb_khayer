import prisma from "@backend/modules/prisma/Prisma";
import {notFound} from "next/navigation";
import React from "react";
import ProductView from "@/app/(web)/product/[id]/ProductView";
import {Metadata} from "next";

const Page = async (props: any) => {
	const product = await prisma.product.findUnique({
		where: {
			id: props?.params?.id
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

	return (
		<ProductView product={product}/>
	)
}

export const generateMetadata = async (props: any) => {
	const product = await prisma.product.findUnique({
		where: {
			id: props?.params?.id
		}
	});
	if (!product) return {};
	const custom = Object.fromEntries([
		`product_id:${product.id}`,
		`product_name:${product.name}`,
		`og-image:${product.images?.at?.(0)}`,
		`product_price:${product.price}`,
		`product_old_price:${product.price}`,
		`availability:${product.stock > 0 ? "instock":"outofstock"}`
	].map(o => (
		[o.split(":")[0].replace("-",":"),o.split(":")?.at?.(-1)+""]
	)))

	return {
		title: product.name,
		description: product.description_text,
		keywords: product.name.split(" "),
		other: custom
	} as Metadata
}

export const dynamic = 'force-dynamic'

export default Page;
