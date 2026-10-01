"use client";


import {useAction} from "@/utils/server";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {Badge, Button, FileInput, Select, TextInput, TextInput as Input} from "@mantine/core";
import React, {useState} from "react";
import {Attachment, Course, Prisma} from "@prisma/client";
import {uploadFile} from "@/utils/api";
import {IconFile, IconImageInPicture, IconPlus, IconTrash} from "@tabler/icons-react";
import BlogContentEditor from "@/app/(web)/admin/courses/new/BlogContentEditor";
import {closeLastModal, modal} from "@/utils/modal";
import {AttachmentTypeInfo} from "@/generated/AttachmentType.enum";
import ApiLoadingState, {_SET_API_LOADING} from "@/components/api/ApiLoadingState";
import {useRouter} from "next/navigation";
import AttachmentCreateManyArgs = Prisma.AttachmentCreateManyArgs;
import CourseUpdateArgs = Prisma.CourseUpdateArgs;
import AddAttachment from "@/app/(web)/admin/courses/new/AddAttachment";

const NewCourse = (props: {
	course: Course,
	attachments: Attachment[],
	searchParams: any
}) => {
	let {attachments: defaultAtt = [], course} = props;
	const catId = props.searchParams?.category || course.categoryId;
	const {result: category} = useAction<any>(handlePrismaQuery, "category", "findUnique", {
		where: {
			id: catId
		}
	});
	const router = useRouter();
	const [attachments, setAttachments] = useState<Attachment[]>(defaultAtt)
	const [data, setData] = useState<Partial<Course>>(course || {
		categoryId: catId
	});

	const p = (key: keyof Course) => {
		return {
			key,
			value: data?.[key] as string,
			content: data?.[key] as string,
			onChange: (e?: any) => {
				const value = e?.target?.value ?? e;
				setData(pre => ({
					...pre,
					[key]: value
				} as Course));
			}
		}
	}

	return (
		<div className={'flex flex-col gap-3'}>
			<form action={async (formData: FormData) => {
				const file = formData.get('file') as File;
				const path = `/course/${new Date().getTime()}.$EX`;

				const newPath = await uploadFile(file, path);
				setData(pre => ({
					...pre,
					thumbnail: newPath
				}));
			}} className={'center gap-2'}>
				<img loading='lazy' src={data?.thumbnail} alt={data?.id} className={'h-[100px] w-[100px] object-contain'}/>
				<div className={'flex flex-col gap-2'}>
					<FileInput
						name={'file'}
						leftSection={<IconImageInPicture size={'1rem'} stroke={1.5}/>}
						label="انتخاب عکس دوره"
						required
						placeholder="عکس دوره"
						leftSectionPointerEvents="none"
					/>
					<Button type={'submit'}>
						اپلود عکس دوره
					</Button>
				</div>
			</form>
			<Input disabled value={category?.name} label={'دسته بندی'}/>
			<Input {...p('name')} label={'نام دوره'}/>
			<div className={'flex flex-col gap-2'}>
				<Input {...p('price')} type={'number'} onChange={(e) => setData(pre => ({
					...pre,
					price: +e.target.value as any
				}))} label={'قیمت دوره'}/>
				{!!data?.price && <small>{parseFloat(data?.price + "")?.toLocaleString()} تومان</small>}
			</div>
			<div key={attachments?.length}>
				<div className={'center justify-start gap-2'}>
					<p>فایل های دوره</p>
					<Button size={'xs'} leftSection={<IconPlus size={'1.2rem'}/>} onClick={() => {
						modal(`افزودن فایل به دوره ${data?.name}`, (
							<AddAttachment onEnd={att => {
								setAttachments(pre => ([
									...pre,
									att
								]));
								closeLastModal();
							}}/>
						))
					}}>
						افزودن فایل
					</Button>
				</div>
				<br/>
				<div className={'flex flex-col gap-2'}>
					{attachments.map(att => (
						<div className={'rounded border p-2 center justify-between gap-2'}>
							<div className={'center gap-2'}>
								<p>{att.name}</p>
								<Badge color="blue">{att.type}</Badge>
							</div>
							<div className={'center gap-2'}>
								<a href={att.link} target={'_blank'}>
									<Button size={'xs'} rightSection={<IconFile size={'1rem'}/>}>
										نمایش
									</Button>
								</a>
								<Button
									onClick={async () => {
										if (att?.id) {
											await handlePrismaQuery("attachment", "delete", {
												where: {
													id: att?.id
												}
											});
										}
										setAttachments(p => p?.filter?.(a => a?.link !== att?.link));
									}}
									color={'red'} size={'xs'} rightSection={<IconTrash size={'1rem'}/>}>
									حذف
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className={'center'}>
				<Button onClick={async () => {
					try {
						_SET_API_LOADING(true);
						const course = await (data?.id ? (
							handlePrismaQuery<CourseUpdateArgs, Course>("course", "update", {
								where: {
									id: data?.id
								},
								data: data
							})
						) : (
							handlePrismaQuery("course", "create", {
								data
							})
						));
						const newAtt = attachments
							.filter(d => !d?.id)
							.map(d => ({...d, courseId: course.id}));
						await handlePrismaQuery<AttachmentCreateManyArgs, Attachment[]>("attachment", 'createMany', {
							data: newAtt
						});
						_SET_API_LOADING(true);
						router.push("/admin/courses");
					} catch {
						alert("لطفا در وارد کردن اطلاعات دقت کنید");
					}
				}}>
					ذخیره
				</Button>
			</div>
			<div>
				<p>توضیحات دوره</p>
				<BlogContentEditor {...p('description')} />
			</div>
			<br/>
			<div>
				<TextInput
					disabled={data?.preview === "__LOADING__"}
					label={'لینک ویدیو پیشنمایش'}
					placeholder={'http...'}
					dir={'ltr'}
					value={data?.preview || ''}
					onChange={(e)=>{
						setData(pre => ({
							...pre,
							preview: e?.target?.value
						}))
					}}
					className={'w-full'}
				/>
				<form action={async (e)=>{
					alert("درحال بارگذاری ویدیو...")
					setData(pre => ({
						...pre,
						preview: "__LOADING__"
					}));
					const path = await uploadFile(e.get('file') as File, `/preview/${data?.id}-${Math.random()}-${new Date().getTime()}.$EX`);
					setData(pre => ({
						...pre,
						preview: path
					}))
					alert("ویدیو با موفقیت اپلود شد")
				}} className={'center items-end gap-2'}>
					<FileInput
						name={'file'}
						accept={'.mp4, .mpeg, .mkv'}

						label={'انتخاب ویدیو پیشمایش'}
						placeholder={'جهت اپلود ویدیو کلیک کنید'}
						leftSection={<IconFile />}
						className={'flex-grow'}
					/>
					<Button disabled={data?.preview === "__LOADING__"} type={'submit'}>
						اپلود ویدیو
					</Button>
				</form>
			</div>
		</div>
	)
}



export default NewCourse;
