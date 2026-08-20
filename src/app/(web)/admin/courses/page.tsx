"use client";
import {Accordion, ActionIcon, Button, Center, FileInput, Menu, rem, TextInput} from "@mantine/core";
import {useAction} from "@/utils/server";
import {handleModelPosition, handlePrismaQuery} from "@/app/(web)/admin/action";
import {Category, Course, Prisma} from "@prisma/client";
import React, {useEffect, useState, useTransition} from "react";
import {
	IconChargingPile,
	IconChevronDown, IconChevronUp,
	IconDots,
	IconEdit, IconFile,
	IconImageInPicture,
	IconPlus,
	IconTrash, IconVideo
} from "@tabler/icons-react";
import {closeLastModal, modal} from "@/utils/modal";
import {uploadFile} from "@/utils/api";
import ApiLoadingState from "@/components/api/ApiLoadingState";
import Link from "next/link";
import CategoryFindManyArgs = Prisma.CategoryFindManyArgs;
import CategoryFindUniqueArgs = Prisma.CategoryFindUniqueArgs;
import CategoryUpdateArgs = Prisma.CategoryUpdateArgs;
import prisma from "@backend/modules/prisma/Prisma";
import CourseUpdateManyArgs = Prisma.CourseUpdateManyArgs;
import {useDebouncedState} from "@mantine/hooks";

const Page = (props: any) => {
	const [opened, setOpened] = useState<string | null>(null);
	const [tempSearch, setTempSearch] = useDebouncedState("", 300);
	const [search, setSearch] = useState('')
	const {result: categories, isPending, refetch} = useAction(handlePrismaQuery, "category", 'findMany', {
		where: {
			parentId: {
				equals: null
			},
			...(search && {
				name: {
					contains: search
				},
				courses: {
					some: {
						name: {
							contains: search
						}
					}
				}
			})
		},
		orderBy: {
			created_at: "asc"
		}
	} as CategoryFindManyArgs) as (
		{result: Category[],
		[key: string | symbol]: any });


	return (
		<div className={'w-full'}>
			<div className={'center justify-between'}>
				<h4>مدیریت دوره ها</h4>
				<Button onClick={async () => {
					const name = await window.prompt("نام دسته بندی را وارد کنید");
					if (!name) return;
					await handlePrismaQuery("category", "create", {
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
				{categories?.map(category => (
					<CategoryItem search={search} open={opened === category?.id} refetch={refetch} {...category} />
				))}
			</Accordion>
		</div>
	)
}

const CategoryItem = (props: Category & { open: boolean, refetch: any, search?: string }) => {
	const {open = false} = props;
	const [opened, setOpened] = useState<string | null>(null)
	const [children, setChildren] = useState<Category[]>([]);
	const [courses, setCourses] = useState<Course[]>([])
	const [isPending, startTransition] = useTransition()

	const refetch = () => {
		startTransition(async () => {
			const category = await handlePrismaQuery("category", "findUnique", {
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
								name: {
									contains: props.search
								}
							}
						})
					},
					courses: {
						orderBy: {
							created_at: "asc"
						},
						...(props.search && {
							where: {
								name: {
									contains: props.search
								}
							}
						})
					}
				}
			} as CategoryFindUniqueArgs);
			setChildren(category.children);
			setCourses(category.courses);
		})
	}

	useEffect(() => {
		if (open) refetch();
	}, [open, props.search]);

	return (
		<Accordion.Item value={props.id} className={'relative shadow my-2'}>
			<AccordionControl  {...props} refetch={refetch}
						    parentRefetch={props.refetch}>
				<div className={'center justify-start gap-2'}>
					<img loading='lazy' src={props.thumbnail} alt={props.name}
						className={'rounded-lg shadow w-12 h-12 object-cover'}/>
					<p>{props.name}</p>
					<ModelPosition modelName={'category'} id={props?.id} refetch={props?.refetch} />
				</div>
			</AccordionControl>
			<Accordion.Panel className={'relative'}>
				{open && <ApiLoadingState/>}
				<Accordion value={opened} onChange={setOpened} chevronPosition="left">
					{children?.map(child => (
						<CategoryItem {...child} open={opened === child?.id} refetch={refetch}/>
					))}
				</Accordion>

				<div className={'flex flex-col gap-2'}>
					{!!courses?.length && <p>دوره ها</p>}
					{courses.map(item => (
						<div key={item?.id} className={'w-full border rounded center justify-between px-3'}>
							<div className={' p-2 center gap-2'}>
								<img loading='lazy' className={'w-10 rounded-lg h-10'} src={item.thumbnail} alt={item.name}/>
								<div>
									<p>{item?.name}</p>
									<div className={'center justify-start gap-2'}>
										<p className={'text-gray-500 text-xs'}>{new Date(item?.updated_at)?.toLocaleDateString('fa')} - {item.price.toLocaleString("fa")} تومان</p>
										<ModelPosition key={'coursePosition'} id={item?.id} modelName={'course'} refetch={refetch} />
									</div>
								</div>
							</div>
							<div className={'center gap-2'}>
								<Link href={`/admin/courses/${item?.id}`}>
									<Button color={'orange'} size={'xs'}
										   rightSection={<IconEdit size={'1rem'}/>}>
										ویرایش
									</Button>
								</Link>
								<ActionIcon color={'red'} onClick={async () => {
									if (window.confirm(`آیا میخواهید دوره ${item?.name}`)) {
										await handlePrismaQuery('course', "delete", {
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
				{!children?.length && (
					<p className={'text-center'}>{isPending ? "درحال بارگذاری" : "زیر دسته بندی ای یافت نشد"}</p>
				)}
			</Accordion.Panel>
		</Accordion.Item>
	)
}

function AccordionControl(props: Partial<Category & { [key: string | symbol]: any }>) {
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
						await handlePrismaQuery("category", "create", {
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
								await handlePrismaQuery("category", "update", {
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
								<img loading='lazy' src={props.thumbnail + `?${new Date().getTime()}`} alt={props.name}
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
						await handlePrismaQuery("category", "update", {
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
								await handlePrismaQuery("category", "delete", {
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
					<Link href={`/admin/courses/new?category=${props.id}`}>
						<Menu.Item
							leftSection={<IconPlus color={'blue'} style={{width: rem(14), height: rem(14)}}/>}>
							افزودن دوره
						</Menu.Item>
					</Link>
					<Link href={`/admin/courses/quick?category=${props.id}`}>
						<Menu.Item
							leftSection={<IconChargingPile color={'blue'} style={{width: rem(14), height: rem(14)}}/>}>
							افزودن سریع
						</Menu.Item>
					</Link>
					<Menu.Item
						onClick={()=>{
							modal(`اپلود پیش نمایش برای دوره های ${props?.name}`,<UploadPreview category={props} />)
						}}
						leftSection={<IconVideo color={'red'} style={{width: rem(14), height: rem(14)}}/>}>
						پیش نمایش
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Center>
	);
}

export function ModelPosition(props: {
	id: string,
	modelName: keyof typeof prisma,
	refetch: any,
	where?: any,
	disabled?: boolean
}) {
	let {id, modelName} = props;
	return (
		<div className={'center gap-1'}>
			{['up', 'down'].map((action) => (
				<ActionIcon disabled={props.disabled} size={'sm'} onClick={async (e) => {
					e.stopPropagation();
					e.preventDefault();
					await handleModelPosition(modelName, id, action as any, props.where || undefined);
					props?.refetch();
				}}>
					{action === 'down' ? <IconChevronDown/>:<IconChevronUp/>}
				</ActionIcon>
			))}
		</div>
	)
}

export function UploadPreview(props: {category: Partial<Category>}) {
	let {category} = props;
	const [preview, setPreview] = useState<string>();

	useEffect(() => {
		if (preview && preview.startsWith("/")) {
			handlePrismaQuery<CourseUpdateManyArgs>("course", "updateMany", {
				where: {
					categoryId: category?.id
				},
				data: {
					preview
				}
			}).then(()=>alert("باموفقیت پیش نمایش برای دوره ها تنظیم شد"))
		}
	}, [preview]);

	return (
		<form action={async (e) => {
			alert("درحال بارگذاری ویدیو...")
			setPreview("__LOADING__");
			uploadFile(e.get('file') as File, `/preview/${category?.id}-${Math.random()}-${new Date().getTime()}.$EX`).then((path)=>{
				setPreview(path);
				alert("ویدیو با موفقیت اپلود شد")
			}).catch(()=>{
				alert("خطا در بارگذاری دوره")
			});
		}} className={'center items-end gap-2'}>
			<FileInput
				name={'file'}
				accept={'.mp4, .mpeg, .mkv'}
				label={'انتخاب ویدیو پیشمایش'}
				placeholder={'جهت اپلود ویدیو کلیک کنید'}
				leftSection={<IconFile/>}
				className={'flex-grow'}
			/>
			<Button disabled={preview === "__LOADING__"} type={'submit'}>
				اپلود ویدیو
			</Button>
		</form>
	)
}

export default Page;
