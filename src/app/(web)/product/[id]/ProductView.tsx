"use client";
import {Product, ProductCategory} from "@prisma/client";
import React, {useEffect, useState} from "react";
import {ActionIcon, Button, ButtonGroup, NumberInput} from "@mantine/core";
import {getCart, setLocalCart, useCart} from "@/utils/localCart";
import {_openCart} from "@/app/(web)/WebHeader";
import ProductCard from "@/app/(web)/ProductCard";
import {IconError404, IconInfoCircle} from "@tabler/icons-react";
import Link from "next/link";
import ProductCartHandler from "@/app/(web)/product/[id]/ProductCartHandler";
import {modal} from "@/utils/modal";
import HowCanITrust from "@/app/(web)/product/[id]/HowCanITrust";

const ProductView = (props: {
	product: Product & { category?: ProductCategory & { products?: Product[] } }
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
		properties,
		updated_at,
		stock = 0
	} = props.product;
	const [active, setActive] = useState(images?.[0]);
	const cart = useCart();
	const productCart = cart[props?.product?.id];
	const related = props?.product?.category?.products?.filter?.(c => c?.id !== props?.product?.id);

	return (
		<section className=" py-11 font-poppins dark:bg-gray-800">
			<div className="max-w-6xl px-4 py-4 mx-auto lg:py-8 md:px-6">
				<div className="flex flex-wrap -mx-4">
					<div className="w-full px-4 md:w-1/2 ">
						<div className="sticky top-5 z-10 overflow-hidden ">
							<div className="relative mb-6 lg:mb-10 lg:h-2/4 ">
								<img loading='lazy'
									src={active}
									alt={name}
									className="object-cover w-full lg:h-full "
								/>
							</div>
							<div className="flex-wrap hidden md:flex ">
								{images?.map?.(src => (
									<div className="w-1/2 p-2 sm:w-1/4">
										<div
											onClick={() => setActive(src)}
											className="block cursor-pointer border border-blue-300 dark:border-transparent dark:hover:border-blue-300 hover:border-blue-300"
										>
											<img loading='lazy'
												src={src}
												alt={name}
												className="object-cover w-full lg:h-20"
											/>
										</div>
									</div>
								))}
							</div>
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
										className={`${stock <= 0 ? "bg-red-400" : "bg-green-400"} text-white p-2 rounded-xl font-bold`}>{stock <= 0 ? "ناموجود" : "موجود"}</p>
								</div>
								<div className="flex items-center mb-6">

								</div>
								<p className="max-w-md mb-8 text-gray-700 dark:text-gray-400 overflow-hidden"
								   dangerouslySetInnerHTML={{__html: description}}>

								</p>
								<p className="inline-block mb-8 text-4xl font-bold text-gray-700 dark:text-gray-400 ">
									<span>{price.toLocaleString("fa")} تومان</span>
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
								<Button onClick={()=>{
									setLocalCart(props.product, 1);
									modal("به سبد خرید اضافه شد" , <HowCanITrust product={props.product} />)
								}}>
									افزودن به سبد خرید
								</Button>
							):(
								<div className={'center gap-2'}>
									<div className={'rounded-full text-lg center p-1 bg-primary text-white min-w-[50px] min-h-[50px]'}>
										{productCart.quantity}
									</div>
									<div className={'cursor-pointer'} onClick={()=>_openCart()}>
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
