"use client";
import {Product, ProductCategory} from "@prisma/client";
import React, {useEffect, useState} from "react";
import {ActionIcon, Button, ButtonGroup, NumberInput} from "@mantine/core";
import {getCart, setLocalCart, useCart} from "@/utils/localCart";
import {_openCart} from "@/app/(web)/WebHeader";
import ProductCard from "@/app/(web)/ProductCard";
import {IconError404, IconInfoCircle} from "@tabler/icons-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import ProductCartHandler from "@/app/(web)/product/[id]/ProductCartHandler";
import {modal} from "@/utils/modal";
import HowCanITrust from "@/app/(web)/product/[id]/HowCanITrust";
import ProductImageGallery from "@/components/shop/ProductImageGallery";

const ProductView = (props: {
	product: Product & { category?: ProductCategory & { products?: Product[] } },
	saleEnabled?: boolean
}) => {
	let {
		categoryId,
		created_at,
		description,
		description_text,
		id,
		images,
		name,
		price,
		originalPrice,
		discountPercent,
		isSpecial,
		isBestSeller,
		properties,
		updated_at,
		stock = 0
	} = props.product;
	const available = (props.saleEnabled !== false) && stock > 0;
	const hasDiscount = (discountPercent || 0) > 0 && originalPrice;
	const cart = useCart();
	const router = useRouter();
	const productCart = cart[props?.product?.id];
	const related = props?.product?.category?.products?.filter?.(c => c?.id !== props?.product?.id);

	return (
		<section className=" py-11 font-poppins dark:bg-gray-800">
			<div className="max-w-6xl px-4 py-4 mx-auto lg:py-8 md:px-6">
				<div className="flex flex-wrap -mx-4">
					<div className="w-full px-4 md:w-1/2 ">
						<div className="sticky top-5 z-10 overflow-hidden ">
							<ProductImageGallery images={images || []} alt={name}/>
						</div>
					</div>
					<div className="w-full px-4 md:w-1/2 relative">
						<div className="lg:pl-20">
							<div className="mb-8 ">
								<div className={'center justify-between mt-2 mb-6'}>
									<h1 className="max-w-xl  text-2xl font-bold dark:text-gray-400 md:text-4xl">
										{name}

									</h1>
									<p
										className={`${available ? "bg-green-400" : "bg-red-400"} text-white p-2 rounded-xl font-bold`}>{available ? "موجود" : "ناموجود"}</p>
								</div>
								{(isSpecial || isBestSeller || hasDiscount) && (
									<div className="flex items-center gap-2 mb-4 flex-wrap">
										{isSpecial && <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-bold">محصول ویژه</span>}
										{isBestSeller && <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold">پرفروش</span>}
										{hasDiscount && <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">٪{Number(discountPercent).toLocaleString("fa")} تخفیف</span>}
									</div>
								)}
								<p className="max-w-md mb-8 text-gray-700 dark:text-gray-400 overflow-hidden"
								   dangerouslySetInnerHTML={{__html: description}}>

								</p>
								<p className="inline-block mb-8 text-4xl font-bold flex items-center gap-3 flex-wrap">
									<span className="text-blue-600">{price.toLocaleString("fa")} تومان</span>
									{hasDiscount && <span className="text-xl text-gray-400 line-through">{Number(originalPrice).toLocaleString("fa")} تومان</span>}
								</p>
								<br/>
							</div>
							<div className={'center gap-5 justify-start flex-wrap'}>
								{properties?.split?.("\n")?.map?.(line => (
									<div className={'center justify-start gap-2'}>
										{line.split(":")?.map((item, i) =>
											<p className={i === 0 ? "font-bold" : ""}>{item?.trim?.()}{i === 0 && ":"}</p>
										)}
									</div>
								))}
							</div>
							<br/>

						</div>
					</div>
					<div className={'sticky sm:rounded-full md:px-5 bottom-[65px] sm:bottom-12 w-full z-30 p-3 bg-white shadow center justify-between'}>
						<div className={'center justify-between w-full'}>
							{!productCart ? (
								<Button disabled={!available} onClick={()=>{
									setLocalCart(props.product, 1);
									router.push("/dashboard/cart");
								}}>
									{available ? "افزودن به سبد خرید" : "ناموجود"}
								</Button>
							):(
								<div className={'center gap-2'}>
									<div className={'rounded-full text-lg center p-1 bg-primary text-white min-w-[50px] min-h-[50px]'}>
										{productCart.quantity}
									</div>
									<div className={'cursor-pointer'} onClick={()=>router.push("/dashboard/cart")}>
										<p>در سبد خرید</p>
										<p>مشاهده
										<span className={'text-primary'}> سبد خرید</span>
										</p>
									</div>
								</div>
							)}
							<p className={'text-md md:text-lg lg:text-[25px]'}>{price.toLocaleString("fa")} تومان</p>
						</div>
					</div>
				</div>
				<br/>
				<br/>
				<div className={'center justify-between mb-2'}>
					<h3>محصولات مرتبط</h3>
					<Link href={`/category/${categoryId}`}>
						<Button>
							مشاهده همه
						</Button>
					</Link>
				</div>
				<div className={'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-2 gap-2'}>
					{!related?.length && (
						<div className={'center justify-start gap-2'}>
							<IconInfoCircle size={'2rem'} className={'text-red-400'}/>
							<p className={'text-xl font-bold'}>موردی یافت نشد</p>
						</div>
					)}
					{related?.map?.(p => <ProductCard product={p}/>)}
				</div>
			</div>

		</section>

	)
}

export default ProductView;
