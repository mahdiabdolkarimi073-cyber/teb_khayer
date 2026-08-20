"use client";
import {Accordion, ActionIcon, Button, Center, Menu, Pagination, rem, TextInput} from "@mantine/core";
import {useAction} from "@/utils/server";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {Category, Prisma, Product} from "@prisma/client";
import React, {useEffect, useMemo, useState, useTransition} from "react";
import {IconCopy, IconDots, IconEdit, IconImageInPicture, IconPlus, IconReplace, IconTrash} from "@tabler/icons-react";
import {closeLastModal, modal} from "@/utils/modal";
import {uploadFile} from "@/utils/api";
import ApiLoadingState from "@/components/api/ApiLoadingState";
import Link from "next/link";
import {ModelPosition} from "@/app/(web)/admin/courses/page";
import CategoryFindManyArgs = Prisma.CategoryFindManyArgs;
import CategoryFindUniqueArgs = Prisma.CategoryFindUniqueArgs;
import CategoryUpdateArgs = Prisma.CategoryUpdateArgs;
import {useDebouncedState, useLocalStorage} from "@mantine/hooks";
import ProductCountArgs = Prisma.ProductCountArgs;
import ProductFindManyArgs = Prisma.ProductFindManyArgs;
import Loading from "@/app/(app)/loading";
import Image from "next/image";


const generateOR = (search: string) => {
	const def = [
		{
			name: {
				contains: search,
			},
		},
		{
			products: {
				some: {
					OR: [
						{
							name: {
								contains: search
							}
						},
					]
				}
			}
		},
	];
	return [
		...def,
		{
			children: {
				some: {
					OR: [
						...def,
						{
							children: {
								some: {
									OR: [
										...def,
										{
											children: {
												some: {
													OR: [
														...def,
														{
															children: {
																some: {
																	OR: [
																		...def,

																	]
																}
															}
														}
													]
												}
											}
										}
									]
								}
							}
						}
					]
				}
			}
		}
	]
}

const Page = (props: any) => {
	const [opened, setOpened] = useState<string | null>(null);
	const [tempSearch, setTempSearch] = useDebouncedState("", 300);
	const [search, setSearch] = useState('')

	let lvl = 0;
	const defaultOR = useMemo(()=>generateOR(search),[search]);
	const {
		result: categories,
		isPending,
		refetch
	} = useAction(handlePrismaQuery, "productCategory", 'findMany', {
		where: {
			parentId: {
				equals: null
			},
			...(search && {
				OR: defaultOR
			}),
		},
		orderBy: {
			created_at: "asc"
		}
	} as CategoryFindManyArgs);

	return (
		<div className={'w-full'}>
			<div className={'center justify-between'}>
				<h4>مدیریت محصولات</h4>
				<Button onClick={async () => {
					const name = await window.prompt("نام دسته بندی را وارد کنید");
					if (!name) return;
					await handlePrismaQuery("productCategory", "create", {
						data: {
							name
						}
					});
					refetch();
				}}>
					ساخت دسته بندی جدید
				</Button>
			</div>
			<div className={'center justify-end gap-1 items-end'}>
				<TextInput
					label={'جستجو...'}
					defaultValue={tempSearch}
					onChange={(e) => setTempSearch(e?.target?.value)}
				/>
				<Button onClick={() => setSearch(tempSearch)}>
					جستجو
				</Button>
			</div>
			<br/>
			<Accordion value={opened} onChange={(e) => setOpened(e)} chevronPosition="left" className={' relative'}>
				<ApiLoadingState/>
				{(categories as Category[])?.map((category) => (
					<CategoryItem search={search} open={opened === category?.id} refetch={refetch} {...category} />
				))}
			</Accordion>
		</div>
	)
}

const CategoryItem = (props: Category & { open: boolean, refetch: any, search?: string }) => {
	const take = 10;
	const [copy, setCopy] = useLocalStorage({
		key: "copy"
	});
	const {open = false} = props;
	const [opened, setOpened] = useState<string | null>(null)
	const [children, setChildren] = useState<Category[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [count, setCount] = useState(0);
	const [skip, setSkip] = useState(0)
	const [isPending, startTransition] = useTransition()

	const refetch = () => {
		startTransition(async () => {
			const category = await handlePrismaQuery("productCategory", "findUnique", {
				where: {
					id: props?.id
				},
				include: {
					children: {
						orderBy: {
							created_at: "asc"
						},
						...(props.search && {
							where: {
								OR: generateOR(props.search)
							}
						})
					},
					products: {
						orderBy: {
							created_at: "asc"
						},
						...(props.search && {
							where: {
								OR: [
									{
										name: {
											contains: props?.search
										}
									}
								]
							}
						}),
						take,
						skip
					}
				}
			} as CategoryFindUniqueArgs);

			setChildren(category?.children);
			setProducts(category?.products);
		});
		handlePrismaQuery("product", "count", {
			where: {
				categoryId: props?.id,
				...(props.search && {
					OR: [
						{
							name: {
								contains: props?.search
							}
						}
					]
				})
			}
		} as ProductCountArgs).then(setCount);
	}

	useEffect(() => {
		if (open) refetch();
	}, [open, props.search, skip]);

	return (
		<Accordion.Item value={props.id} key={props.id} className={'relative shadow my-2'}>
			<AccordionControl  {...props} refetch={refetch}
						    parentRefetch={props.refetch}>
				<div className={'center justify-start gap-2'}>
					<img loading='lazy' src={props.thumbnail} alt={props.name}
						className={'rounded-lg shadow w-12 h-12 object-cover'}/>
					<p>{props.name}</p>
					<ModelPosition where={{
						parentId: props.parentId
					}} modelName={'productCategory'} id={props?.id} refetch={props?.refetch}/>
				</div>
			</AccordionControl>
			<Accordion.Panel className={'relative'}>
				{open && <ApiLoadingState/>}
				<Accordion value={opened} onChange={setOpened} chevronPosition="left">
					{children?.map(child => (
						<CategoryItem {...child} open={opened === child?.id} search={props.search} refetch={refetch} key={child?.id} />
					))}
				</Accordion>

				<div className={'flex flex-col gap-2'}>
					{!!products?.length && <p>محصول ها ({count})</p>}
					{count > take && (
						<div className={'center'}>
							<Pagination key={count} disabled={isPending} total={Math.ceil(count / take)} value={Math.ceil(skip / take) + 1}
									  onChange={(e) => {
										  const n = (e - 1) * take;
										  setSkip(n);
									  }}/>
						</div>
					)}
					{products.map(item => (
						<div className={'w-full border rounded center justify-between px-3'} key={item.id}>
							<div className={' p-2 center gap-2'}>
								<img loading='lazy' className={'w-10 rounded-lg h-10'} src={item.images?.[0]+""}
									alt={item.name} />
								<div>
									<p>{item?.name}</p>
									<div className="center gap-2">
										<p className={'text-gray-500 text-xs'}>{new Date(item?.updated_at)?.toLocaleDateString('fa')} - {item.price.toLocaleString("fa")} تومان</p>
										{!props.search && (
											<ModelPosition
												disabled={isPending}
												key={'productPosition'} id={item?.id}
														where={{
															categoryId: props.id
														} as ProductFindManyArgs['where']}
														modelName={'product'} refetch={refetch}/>
										)}
									</div>
								</div>
							</div>
							<div className={'center gap-2 flex-wrap'}>
								<ActionIcon color={'blue'} title={'کپی'} onClick={() => {
									setCopy(item as any);
									alert("کپی شد")
								}}>
									<IconCopy size={'1rem'}/>
								</ActionIcon>
								<Link href={`/admin/products/${item?.id}`}>
									<ActionIcon color={'orange'}>
										<IconEdit size={'1rem'}/>
									</ActionIcon>
								</Link>
								<ActionIcon color={'red'} onClick={async () => {
									if (window.confirm(`آیا میخواهید محصول ${item?.name}`)) {
										await handlePrismaQuery('product', "delete", {
											where: {
												id: item.id,
											}
										});
										refetch();
									}
								}}>
									<IconTrash size={'1rem'}/>
								</ActionIcon>
							</div>
						</div>
					))}
				</div>
				{isPending && <p>درحال بارگذاری</p>}
			</Accordion.Panel>
		</Accordion.Item>
	)
}

function AccordionControl(props: Partial<Category & { [key: string | symbol]: any }>) {
	const [copy, setCopy] = useLocalStorage({
		key: "copy"
	});

	return (
		<Center>
			<Accordion.Control {...props} />
			<Menu shadow="md" width={200}>
				<Menu.Target>
					<ActionIcon size="lg" variant="subtle" color="black">
						<IconDots size="1rem"/>
					</ActionIcon>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>دسته بندی</Menu.Label>
					<Menu.Item onClick={async () => {
						const name = await window.prompt("نام دسته بندی را وارد کنید");

						if (!name) return;
						await handlePrismaQuery("productCategory", "create", {
							data: {
								name,
								parentId: props.id
							}
						});
						props.refetch();
					}} leftSection={<IconPlus color={'green'} style={{width: rem(14), height: rem(14)}}/>}>
						زیر دسته بندی
					</Menu.Item>
					<Menu.Item onClick={async () => {
						modal(`ویرایش عکس دسته بندی ${props.name}`, (
							<form action={async (formData: FormData) => {
								const newPath = await uploadFile(formData.get('file') as File, `/category/${props.id}-${new Date().getTime()}.$EX`);
								await handlePrismaQuery("productCategory", "update", {
									where: {
										id: props?.id
									},
									data: {
										thumbnail: newPath
									}
								});
								props.parentRefetch();
								closeLastModal();
							}}>
								<img loading='lazy' src={props.thumbnail + `?${new Date().getTime()}`}
									alt={props.name}
									className={'w-full object-contain'}/>
								<br/>
								<input hidden name={'id'} value={props.id}/>
								<input id='selector' placeholder={'انتخاب فایل'} type={'file'} name={'file'}/>
								<br/>
								<Button type={'submit'}>
									ارسال فایل
								</Button>
							</form>
						))
					}} leftSection={<IconImageInPicture color={'purple'}
												 style={{width: rem(14), height: rem(14)}}/>}>
						ویرایش عکس
					</Menu.Item>
					<Menu.Item onClick={async () => {
						const name = await window.prompt("نام جدید دسته بندی را وارد کنید") + "";
						await handlePrismaQuery("productCategory", "update", {
							where: {
								id: props.id
							},
							data: {
								name
							}
						} as CategoryUpdateArgs);
						props.parentRefetch();
					}} leftSection={<IconEdit color={'orange'} style={{width: rem(14), height: rem(14)}}/>}>
						ویرایش
					</Menu.Item>
					<Menu.Item
						onClick={async () => {
							if (window.confirm("آیا میخواید دسته بندی را حذف کنید؟")) {
								await handlePrismaQuery("productCategory", "delete", {
									where: {
										id: props.id
									}
								});
								props.parentRefetch();
							}
						}}
						leftSection={<IconTrash color={'red'} style={{width: rem(14), height: rem(14)}}/>}>
						حذف
					</Menu.Item>
					<Menu.Divider/>
					<Link href={`/admin/products/new?category=${props.id}`}>
						<Menu.Item
							leftSection={<IconPlus color={'blue'} style={{width: rem(14), height: rem(14)}}/>}>
							افزودن محصول
						</Menu.Item>
					</Link>
					{!!copy && (
						<Menu.Item
							onClick={() => {
								handlePrismaQuery("product", "create", {
									data: {
										...(copy || {}) as any,
										id: undefined,
										created_at: undefined,
										categoryId: props.id
									}
								}).then(props.refetch).catch(() => alert("خطا در ساخت محصول"))
							}}
							leftSection={<IconReplace color={'green'}
												 style={{width: rem(14), height: rem(14)}}/>}>
							پیست محصول
						</Menu.Item>
					)}
				</Menu.Dropdown>
			</Menu>
		</Center>
	);
}

export default Page;
