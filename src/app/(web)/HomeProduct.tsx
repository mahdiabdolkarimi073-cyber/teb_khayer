
import prisma from "@backend/modules/prisma/Prisma";
import ProductCard from "@/app/(web)/ProductCard";
import {IconChevronLeft, IconSparkles, IconFlame, IconPercentage, IconAward} from "@tabler/icons-react";
import React from "react";
import {Button} from "@mantine/core";
import Link from "next/link";
import {getVar} from "@backend/utils/setting";

const HomeProduct = async (props: any) => {
	const [latestProducts, bestSellers, discounted, specialProducts] = await Promise.all([
		prisma.product.findMany({
			take: 8,
			include: { category: true },
			orderBy: { created_at: "desc" },
		}),
		prisma.product.findMany({
			take: 4,
			where: { isBestSeller: true },
			include: { category: true },
			orderBy: { created_at: "desc" },
		}),
		prisma.product.findMany({
			take: 4,
			where: { discountPercent: { gt: 0 } },
			include: { category: true },
			orderBy: { discountPercent: "desc" },
		}),
		prisma.product.findMany({
			take: 4,
			where: { isSpecial: true },
			include: { category: true },
			orderBy: { created_at: "desc" },
		}),
	]);
	const saleEnabled = (await getVar<string>("PRODUCTS_SALE_ENABLED")) !== "false";

	const renderSection = (title: string, icon: React.ReactNode, products: any[], href: string, btnLabel: string) => {
		if (!products?.length) return null;
		return (
			<div className={'container mx-auto p-2 lg:p-0 mb-6'}>
				<div className={'center justify-between'}>
					<div className="center gap-2">
						{icon}
						<h3>{title}</h3>
					</div>
					<Link href={href}>
						<Button size={'md'} rightSection={<IconChevronLeft size={'1.2rem'} />} className={'rounded-full'}>
							{btnLabel}
						</Button>
					</Link>
				</div>
				<br/>
				<div className={'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-2 gap-2'}>
					{products?.map?.(p => <ProductCard product={p} saleEnabled={saleEnabled} />)}
				</div>
			</div>
		);
	};

	return (
		<>
			{renderSection(
				"پرفروش‌ترین محصولات",
				<IconFlame size={'2rem'} className={'text-orange-500'} />,
				bestSellers,
				"/category/all?sort=bestSeller",
				"همه پرفروش‌ها"
			)}
			{renderSection(
				"تخفیف‌های ویژه",
				<IconPercentage size={'2rem'} className={'text-red-500'} />,
				discounted,
				"/category/all?sort=discount",
				"همه تخفیف‌ها"
			)}
			{renderSection(
				"محصولات ویژه",
				<IconAward size={'2rem'} className={'text-blue-500'} />,
				specialProducts,
				"/category/all?sort=special",
				"همه محصولات ویژه"
			)}
			{renderSection(
				"آخرین محصولات",
				<IconSparkles size={'2rem'} className={'text-primary'} />,
				latestProducts,
				"/category/all",
				"محصولات"
			)}
		</>
	)
}

export default HomeProduct;
