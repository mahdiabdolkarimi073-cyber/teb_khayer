"use client";


import {useAction} from "@/utils/server";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {Button, Checkbox, FileInput, NumberInput, Textarea, TextInput as Input} from "@mantine/core";
import React, {useState} from "react";
import {Prisma, Product} from "@prisma/client";
import {uploadFile} from "@/utils/api";
import {IconImageInPicture} from "@tabler/icons-react";
import BlogContentEditor from "@/app/(web)/admin/courses/new/BlogContentEditor";
import {_SET_API_LOADING} from "@/components/api/ApiLoadingState";
import {useRouter} from "next/navigation";
import CourseUpdateArgs = Prisma.CourseUpdateArgs;

const NewProduct = (props: {
	Product: Product,
	searchParams: any
}) => {
	let { Product} = props;
	const catId = props.searchParams?.category || Product.categoryId;
	const {result: productCategory} = useAction(handlePrismaQuery, "productCategory", "findUnique", {
		where: {
			id: catId
		}
	});
	const router = useRouter();
	const [data, setData] = useState<Partial<Product>>(Product || {
		categoryId: catId
	});

	const p = (key: keyof Product)=>{
		return {
			key,
			value: data?.[key] as string,
			content: data?.[key] as string,
			onChange: (e?: any) => {
				const value = e?.target?.value ?? e;
				setData(pre => ({
					...pre,
					[key]: value
				} as Product));
			}
		}
	}

	return (
		<div className={'flex flex-col gap-3'}>
			<div className={'center gap-2'}>
				{data?.images?.map?.(img => (
					<div className={'center flex-col gap-1'}>
						<img loading='lazy' src={img} alt={data?.name} className={'w-[100px] object-contain rounded'} />
						<Button fullWidth onClick={()=>{
							setData(pre => ({
								...pre,
								images: pre?.images?.filter(s => s !== img)
							}))
						}} size={'xs'} color={'red'}>
							حذف
						</Button>
					</div>
				))}
			</div>
			<form action={async (formData: FormData)=>{
				const file = formData.get('file') as File;
				const path = `/Product/${new Date().getTime()}.$EX`;

				const newPath = await uploadFile(file, path);
				setData(pre => ({
					...pre,
					images: [
						...pre?.images || [],
						newPath
					]
				}));
			}} className={'center gap-2'}>
				<div className={'flex flex-col gap-2'}>
					<FileInput
						name={'file'}
						leftSection={<IconImageInPicture size={'1rem'} stroke={1.5} />}
						label="افزودن عکس به محصول"
						required
						placeholder="عکس محصول"
						leftSectionPointerEvents="none"
					/>
					<Button type={'submit'}>
						اپلود عکس محصول
					</Button>
				</div>
			</form>
			<Input disabled value={productCategory?.name} label={'دسته بندی'} />
			<Input {...p('name')} label={'نام محصول'} />

			<div className={'grid grid-cols-2 gap-3'}>
				<div className={'flex flex-col gap-2'}>
					<NumberInput
						label={'قیمت محصول (تومان)'}
						value={data?.price ?? 0}
						onChange={(val) => setData(pre => ({
							...pre,
							price: (val as number) ?? 0
						}))}
						formatter={(value) => !Number.isNaN(parseFloat(value))
							? value.toLocaleString("fa-IR")
							: ''}
						thousandSeparator
					/>
				</div>
				<NumberInput
					label={'موجودی محصول'}
					value={data?.stock ?? 0}
					onChange={(val) => setData(pre => ({
						...pre,
						stock: (val as number) ?? 0
					}))}
				/>
			</div>

			{/* Discount section */}
			<div className={'flex flex-col gap-2 border rounded-xl p-3 bg-gray-50'}>
				<div className={'flex items-center gap-3'}>
					<Checkbox
						label="این محصول تخفیف دارد"
						checked={!!data?.discountPercent && data.discountPercent > 0}
						onChange={(e) => {
							const checked = e.currentTarget.checked;
							setData(pre => ({
								...pre,
								discountPercent: checked ? (pre?.discountPercent || 10) : 0,
								originalPrice: checked ? (pre?.originalPrice || pre?.price || 0) : undefined,
							} as Product));
						}}
					/>
				</div>
				{!!data?.discountPercent && data.discountPercent > 0 && (
					<div className={'grid grid-cols-2 gap-3'}>
						<NumberInput
							label={'درصد تخفیف (٪)'}
							value={data?.discountPercent ?? 0}
							min={1}
							max={99}
							onChange={(val) => {
								const percent = (val as number) ?? 0;
								setData(pre => {
									const orig = pre?.originalPrice ?? pre?.price ?? 0;
									const newPrice = Math.round(orig * (1 - percent / 100));
									return { ...pre, discountPercent: percent, price: newPrice, originalPrice: orig } as Product;
								});
							}}
						/>
						<NumberInput
							label={'قیمت اصلی قبل تخفیف (تومان)'}
							value={data?.originalPrice ?? 0}
							onChange={(val) => {
								const orig = (val as number) ?? 0;
								const percent = data?.discountPercent ?? 0;
								const newPrice = Math.round(orig * (1 - percent / 100));
								setData(pre => ({ ...pre, originalPrice: orig, price: newPrice } as Product));
							}}
							formatter={(value) => !Number.isNaN(parseFloat(value))
								? value.toLocaleString("fa-IR")
								: ''}
							thousandSeparator
						/>
					</div>
				)}
				{!!data?.discountPercent && data.discountPercent > 0 && !!data?.originalPrice && (
					<small className="text-green-600">
						قیمت نهایی پس از تخفیف: {Number(data.price).toLocaleString("fa-IR")} تومان
					</small>
				)}
			</div>

			{/* Product flags */}
			<div className={'flex items-center gap-6 border rounded-xl p-3 bg-gray-50'}>
				<Checkbox
					label="محصول ویژه"
					checked={!!data?.isSpecial}
					onChange={(e) => setData(pre => ({ ...pre, isSpecial: e.currentTarget.checked } as Product))}
				/>
				<Checkbox
					label="پرفروش"
					checked={!!data?.isBestSeller}
					onChange={(e) => setData(pre => ({ ...pre, isBestSeller: e.currentTarget.checked } as Product))}
				/>
			</div>

			<Textarea
				label={'ویژگی های محصول'}
				placeholder={"رنگ: زرد..."}
				{...p('properties')}
			/>
			<div className={'center'}>
				<Button onClick={async ()=>{
					try {
						_SET_API_LOADING(true);
						const Product = await (data?.id ? (
							handlePrismaQuery<CourseUpdateArgs, Product>("product", "update", {
								where: {
									id: data?.id
								},
								data
							})
						):(
							handlePrismaQuery("product", "create", {
								data
							})
						));

						_SET_API_LOADING(true);
						router.push("/admin/products");
					} catch {
						alert("لطفا در وارد کردن اطلاعات دقت کنید");
					}
				}}>
					ذخیره
				</Button>
			</div>
			<div>
				<p>توضیحات محصول</p>
				<BlogContentEditor {...p('description')} onChange={(html, text) => {
					setData(pre => ({
						...pre,
						description: html,
						description_text: text
					}));
				}} />
			</div>
		</div>
	)
}


export default NewProduct;
