'use client';

import {Product} from "@prisma/client";
import React, {useEffect, useState} from "react";
import ProductCard from "@/app/(web)/ProductCard";
import {useAction} from "@/utils/server";
import {getAllProductCount, getProducts} from "@/app/(web)/category/all/action";
import {Pagination, TextInput} from "@mantine/core";
import Loading from "@/app/(app)/loading";
import {useDebouncedState} from "@mantine/hooks";

const AllProductView = (props: {
	products: Product[],
	count: number,
	search?: string
}) => {
	const MAX = 20;
	const [search, setSearch] = useState(props.search || "")
	const [tempSearch, setTempSearch] = useDebouncedState(props.search || "",500)
	const [skip, setSkip] = useState(0)

	let {products: defaultProducts} = props;
	const [products, setProducts] = useState<Product[]>(defaultProducts)
	const {result: nCount, isPending} = useAction(getAllProductCount, search);
	const {result: newProducts, isPending: isL} = useAction(getProducts, skip, search,MAX);
	const [count, setCount] = useState(props.count);

	useEffect(() => {
		if (nCount) setCount(nCount)
	}, [nCount, isPending]);
	useEffect(() => {
		if (newProducts) {
			window.scrollTo(0,0)
			setProducts(newProducts)
		}
	}, [newProducts]);
	useEffect(()=>{
		setSearch(tempSearch)
	}, [tempSearch])

	const pagination = (
		<div className={'center my-2'}>
			<Pagination key={count+""} total={Math.ceil(count / MAX)} value={Math.max(Math.floor(skip / MAX) + 1, 1)}
					  onChange={(page) => setSkip((page - 1) * MAX)}/>
		</div>
	);

	return (
		<div>
			<TextInput

				label={'جستجو...'}
				defaultValue={tempSearch}
				onChange={(e)=>{
					setSkip(0);
					setTempSearch(e?.target?.value)
				}}
			/>
			{pagination}
			{skip !== 0 && isL ? (
				<Loading />
			):(
				<div className={'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-2 gap-2'}>
					{products?.map?.(p => <ProductCard key={p?.id} product={p}/>)}
				</div>
			)}
			{pagination}
		</div>
	)
}

export default AllProductView;
