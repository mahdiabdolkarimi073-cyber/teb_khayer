"use client";

import React, {useEffect, useState, useTransition} from "react";
import {ActionIcon, Button, FileInput, TextInput} from "@mantine/core";
import {readDir} from "@/app/(web)/admin/courses/quick/action";
import {IconImageInPicture, IconX} from "@tabler/icons-react";
import {Attachment, Course, Prisma} from "@prisma/client";
import {useAction} from "@/utils/server";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {arabicToEnglishNumber} from "@/utils/other";
import {generateRandomString} from "@backend/utils/string";
import CourseCreateArgs = Prisma.CourseCreateArgs;
import AttachmentArgs = Prisma.AttachmentArgs;
import AttachmentCreateArgs = Prisma.AttachmentCreateArgs;
import BlogContentEditor from "@/app/(web)/admin/courses/new/BlogContentEditor";
import {uploadFile} from "@/utils/api";

const Page = (props: any) => {
	const categoryId = props?.searchParams?.category;
	const {result: category} = useAction(handlePrismaQuery, "category", "findUnique", {
		where: {
			id: categoryId
		}
	})
	const [folder, setFolder] = useState("")
	const [files, setFiles] = useState<string[]>([]);
	const [defaultData, setDefaultData] = useState<Partial<Course>>({});
	const [courses, setCourses] = useState<(Course & { attachment: Attachment })[]>([])

	useEffect(() => {
		setCourses(files.map(name => {
			let link = `/contents/${folder}/` + encodeURIComponent(name);
			name = name.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d) + "");


			let type = name.split(".").pop()?.toLowerCase();
			let formatArgs = name.split(".");
			name = formatArgs.slice(0, formatArgs.length - 1).join(".");
			name = name.replaceAll("_", " ").replaceAll("-", " ");

			const words = name.split(" ");
			let priceIndex = name.length;
			let price = 0;

			if (name.includes("هزار")) {
				let n = 0;
				for (let word of [...words.reverse()]) {
					word = word.split("").filter(s => !isNaN(+s)).join("")
					if (!isNaN(+word)) {
						price = +word * 1000;
						break;
					}
					n++;
				}
				priceIndex = name.indexOf((price / 1000 + ""));

			}
			let newName = name.slice(0, priceIndex);


			return {
				name: newName,
				thumbnail: defaultData?.thumbnail,
				description: defaultData?.description,
				price: price as unknown as bigint,
				id: "GEN" + generateRandomString(10),
				categoryId: categoryId + "",
				created_at: new Date(),
				updated_at: new Date(),
				attachment: {
					type: type === 'mp4' ? "VIDEO" : type === "pdf" ? "PDF" : "IMG",
					id: `ATT-${generateRandomString(10)}`,
					name: newName,
					link
				}
			} as any
		}))
	}, [files, defaultData]);

	return (
		<div>
			دسته بندی: {category?.name}
			<br/>
			<form action={async (formData: FormData) => {
				const file = formData.get('file') as File;
				const path = `/course/${new Date().getTime()}.$EX`;

				const newPath = await uploadFile(file, path);
				setDefaultData(pre => ({
					...pre,
					thumbnail: newPath
				}));
			}} className={'center gap-2'}>
				<img loading='lazy' src={defaultData?.thumbnail} alt={defaultData?.id}
					className={'h-[100px] w-[100px] object-contain'}/>
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
			<br/>
			<BlogContentEditor
				content={defaultData?.description}
				onChange={(e) => {
					setDefaultData(defaultData => ({
						...defaultData,
						description: e
					}))
				}}
			/>
			<br/>
			<br/>

			<form action={async (e) => {
				const folder = e?.get('path') + "";
				setFolder(folder);
				setFiles(await readDir(folder))
			}} className={'center items-end gap-2'}>
				<TextInput
					className="flex-grow"
					label={'پوشه محلی'}
					description={'مسیر /public/contents'}
					name={'path'}
				/>
				<Button type={'submit'}>
					دریافت اطلاعات
				</Button>
			</form>
			<br/>
			<div className={'center'}>
				<Button onClick={async () => {
					for (let course of courses) {
						const created = await handlePrismaQuery<CourseCreateArgs>("course", 'create', {
							data: {
								...course,
								categoryId,
								// @ts-ignore
								attachment: undefined
							}
						});
						await handlePrismaQuery<AttachmentCreateArgs>("attachment", "create", {
							data: {
								...course.attachment,
								courseId: created?.id
							}
						})
						alert(`دوره ${created.name} افزوده شد`)
					}
				}}>
					افزودن
				</Button>
			</div>
			<br/>

			<div className={'flex flex-col gap-2'}>
				{courses.map((course, i) => {
					const c = (key: keyof (typeof course & Attachment), attachment = false) => {
						return {
							onClick: async () => {
								const value = await window.prompt("مقدار را وارد کنید");
								let converted = isNaN(+(value + "")) ? value : +(value + "");
								let c = [...courses];
								c[i] = {
									...c[i],
									...(attachment ? (
										{
											attachment: {
												...c[i].attachment,
												[key]: converted
											}
										}
									) : ({
										[key]: converted
									}))
								}
								setCourses(c)
							}
						}
					}

					return (
						<div className={'center justify-between rounded border p-2'}>
							<div className={'flex flex-col '}>
								<small>
									<span {...c('name')}>{course?.name}</span>
									{" - "}
									<span {...c('price')}>{course.price?.toLocaleString("fa")}</span>
									تومان
								</small>
								<div>
									<small {...c('name', true)}>{course.attachment?.name}</small>
									{' - '}
									<small {...c('type', true)}>{course.attachment?.type}</small>
									{' - '}
									<a target={'_blank'} href={course?.attachment?.link}>
										<small>لینک</small>
									</a>
								</div>
							</div>
							<ActionIcon onClick={() => {
								let c = [...files];
								c.splice(i, 1);
								setFiles(c);
							}} color='red' size={'xs'}>
								<IconX/>
							</ActionIcon>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default Page;
