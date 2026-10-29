"use client";

import {useAction} from "@/utils/server";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {Button, Checkbox, FileInput, NumberInput, Textarea, TextInput as Input} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {Product} from "@prisma/client";
import {uploadFile} from "@/utils/api";
import {IconImageInPicture, IconTruckDelivery} from "@tabler/icons-react";
import BlogContentEditor from "@/app/(web)/admin/courses/new/BlogContentEditor";
import {_SET_API_LOADING} from "@/components/api/ApiLoadingState";
import {useRouter} from "next/navigation";
import {getProductShipping, saveProductShipping} from "@/app/(web)/admin/products/shipping.action";

const NewProduct = (props: {
	Product?: Product,
	searchParams: any
}) => {
	let { Product } = props;
	const catId = props.searchParams?.category || Product?.categoryId;
	const {result: productCategory} = useAction(handlePrismaQuery, "productCategory", "findUnique", {
		where: {
			id: catId
		}
	});
	const router = useRouter();
	const [data, setData] = useState<Partial<Product>>(Product || {
		categoryId: catId
	});

	// Per-product custom shipping state
	const [hasCustomShipping, setHasCustomShipping] = useState(false);
	const [shippingFee, setShippingFee] = useState<number>(0);
	const [shippingDiscount, setShippingDiscount] = useState<number>(0);

	useEffect(() => {
		if (Product?.id) {
			getProductShipping(Product.id).then((cfg) => {
				if (cfg) {
					setHasCustomShipping(cfg.hasCustomShipping);
					setShippingFee(cfg.shippingFee || 0);
					setShippingDiscount(cfg.shippingDiscount || 0);
				}
			});
		}
	}, [Product?.id]);

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

	const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);

	return (
		<div className={'flex flex-col gap-3'}>
			<div className={'center gap-2'}>
				{data?.images?.map?.(img => (
					<div className={'center flex-col gap-1'} key={img}>
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

			{/* ۱. مدیریت موجودی مستقل از تنظیمات سراسری انبار */}
			<div className={'flex flex-col gap-2 border rounded-xl p-3 bg-gray-50'}>
				<Checkbox
					label="موجودی این محصول را مستقل از تنظیمات کلی مدیریت کن (موجود در انبار)"
					checked={!!data?.forceAvailable}
					onChange={(e) => {
						const checked = e.currentTarget.checked;
						setData(pre => ({ ...pre, forceAvailable: checked } as Product));
					}}
				/>
				<small className="text-gray-500">
					با فعال کردن این گزینه، این محصول حتی زمانی که فروش کلی محصولات در تنظیمات غیرفعال است، به‌عنوان «موجود در انبار» نمایش داده می‌شود و مشتریان می‌توانند آن را بخرند.
				</small>
			</div>

			{/* ۴. هزینه ارسال اختصاصی هر محصول و تخفیف هزینه ارسال */}
			<div className={'flex flex-col gap-3 border rounded-xl p-3 bg-blue-50/50 border-blue-200'}>
				<div className="flex items-center gap-2">
					<IconTruckDelivery size={18} className="text-blue-600" />
					<strong className="text-sm text-blue-900">تنظیمات هزینه ارسال اختصاصی این محصول</strong>
				</div>
				<Checkbox
					label="تعیین هزینه ارسال اختصاصی برای این محصول"
					checked={hasCustomShipping}
					onChange={(e) => setHasCustomShipping(e.currentTarget.checked)}
				/>
				<small className="text-gray-600">
					در صورتی که هزینه ارسال یکپارچه فعال نباشد، هزینه اختصاصی تعیین‌شده در این بخش ملاک قرار می‌گیرد.
				</small>

				{hasCustomShipping && (
					<div className="space-y-3 pt-2">
						<div className="grid grid-cols-2 gap-3">
							<NumberInput
								label="هزینه ارسال اختصاصی (تومان)"
								value={shippingFee}
								min={0}
								onChange={(val) => setShippingFee(Number(val) || 0)}
								formatter={(value) => !Number.isNaN(parseFloat(value)) ? value.toLocaleString("fa-IR") : ''}
								thousandSeparator
							/>
							<NumberInput
								label="تخفیف روی هزینه ارسال (تومان)"
								value={shippingDiscount}
								min={0}
								onChange={(val) => setShippingDiscount(Number(val) || 0)}
								formatter={(value) => !Number.isNaN(parseFloat(value)) ? value.toLocaleString("fa-IR") : ''}
								thousandSeparator
							/>
						</div>

						<div className="p-2.5 rounded-lg bg-white border border-blue-200 text-xs flex items-center justify-between">
							<span>هزینه نهایی ارسال پس از تخفیف:</span>
							<div className="flex items-center gap-2 font-bold">
								{shippingDiscount > 0 && (
									<span className="line-through text-gray-400">
										{shippingFee.toLocaleString("fa-IR")} تومان
									</span>
								)}
								<span className="text-emerald-700 font-black">
									{finalShippingFee.toLocaleString("fa-IR")} تومان
								</span>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className={'flex flex-wrap items-center gap-6 border rounded-xl p-3 bg-gray-50'}>
				<Checkbox
					label="محصول ویژه"
					checked={!!data?.isSpecial}
					onChange={(e) => {
						const checked = e.currentTarget.checked;
						setData(pre => ({ ...pre, isSpecial: checked } as Product));
					}}
				/>
				<Checkbox
					label="پرفروش"
					checked={!!data?.isBestSeller}
					onChange={(e) => {
						const checked = e.currentTarget.checked;
						setData(pre => ({ ...pre, isBestSeller: checked } as Product));
					}}
				/>
				<Checkbox
					label="ارسال رایگان اختصاصی"
					checked={!!data?.freeShipping}
					onChange={(e) => {
						const checked = e.currentTarget.checked;
						setData(pre => ({ ...pre, freeShipping: checked } as Product));
					}}
				/>
				<small className="text-gray-500 basis-full">با فعال کردن این گزینه، برچسب «ارسال رایگان» روی این محصول نمایش داده می‌شود و هزینه ارسال آن صفر است، حتی اگر کل سبد خرید به حد نصاب نرسد.</small>
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
						const {id, created_at, updated_at, ...productData} = data;
						let targetProductId = id;
						if (id) {
							await handlePrismaQuery("product", "update", {
								where: {id},
								data: productData
							});
						} else {
							const created = await handlePrismaQuery("product", "create", {
								data: productData
							});
							targetProductId = created?.id;
						}

						if (targetProductId) {
							await saveProductShipping(targetProductId, {
								hasCustomShipping,
								shippingFee,
								shippingDiscount
							});
						}

						router.push("/admin/products");
					} catch (err) {
						_SET_API_LOADING(false);
						console.error("Save product error:", err);
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
