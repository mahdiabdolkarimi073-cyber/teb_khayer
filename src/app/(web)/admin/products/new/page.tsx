"use client";


import {useAction} from "@/utils/server";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {Button, FileInput, Textarea, TextInput as Input} from "@mantine/core";
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
			<div className={'flex flex-col gap-2'}>
				<Input {...p('price')} type={'number'} onChange={(e) => setData(pre => ({
					...pre,
					price: +e.target.value as any
				}))} label={'قیمت محصول'} />
				{!!data?.price && <small>{parseFloat(data?.price + "")?.toLocaleString()} تومان</small>}
			</div>
			<Input {...p('stock')} type={'number'} onChange={(e) => setData(pre => ({
				...pre,
				stock: +e.target.value as any
			}))} label={'موجودی محصول'} />
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
								data: data
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
