'use client';

import ServiceTypeEnum from "@/generated/ServiceType.enum";
import {Button, TextInput} from "@mantine/core";
import React from "react";
import Link from "next/link";
import TaghvimTypeEnum from "@/generated/TaghvimType.enum";
import {Service, ServiceType, Setting, SettingKey, Taghvim, TaghvimType} from "@prisma/client";
import UploadTaghvimFile from "@/app/(web)/admin/services/UploadTaghvimFile";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {useAction} from "@/utils/server";
import Loading from "@/app/(app)/loading";
import {setServiceDisabled} from "@/app/(web)/admin/services/action";
import {useRouter} from "next/navigation";
import SettingKeyEnum, {SettingKeyInfo} from "@/generated/SettingKey.enum";
import {formDataToJson} from "@/utils/other";
import {setVar} from "@backend/utils/setting";

const Page = (props: any) => {

	const action = useAction(handlePrismaQuery, "service", 'findMany');
	const action2 = useAction(handlePrismaQuery, "taghvim", 'findMany');
	const action3 = useAction(handlePrismaQuery, "setting", 'findMany');
	const router = useRouter();

	if (action.isPending || action2.isPending || action3.isPending) return <Loading/>

	const services = action.result as Service[]
	const taghvims = action2.result as Taghvim[]
	const settings = (action3.result || []) as Setting[]

	console.log(settings,SettingKeyInfo);

	return (
		<div className={'center flex-col gap-2'}>
			<h4>خدمات</h4>
			<hr className={'my-1 w-full'}/>
			{Object.entries(ServiceTypeEnum).map(async ([key, name]) => {
				const service = services.find(c => c.id === key);

				return (
					<div className={'center justify-between w-full gap-2 flex-wrap border p-2 rounded-lg'}>
						<h5>{name}</h5>
						<div className={'center gap-1'}>
							<Link href={`/admin/services/${key}`}>
								<Button size={'xs'}>
									مدیریت
								</Button>
							</Link>
							<Button onClick={() => {
								setServiceDisabled(key as ServiceType, !service?.disabled).finally(action.refetch)
							}} type={'submit'} color={service?.disabled ? "green" : "red"} size={'xs'}>
								{service?.disabled ? "فعال" : "غیرفعال"} سازی
							</Button>
						</div>
					</div>
				);
			})}
			<br/>
			<h4>تقویم ها</h4>
			<hr className={'my-1 w-full'}/>
			{Object.entries(TaghvimTypeEnum).map(async ([key, name]) => {
				const taghvim = taghvims?.find?.(c => c?.id === key);

				return (
					<div className={'center justify-between w-full border p-2 rounded-lg'}>
						<div>
							<h5>{name}</h5>
							<p>{taghvim?.updated_at && new Date(taghvim.updated_at).toLocaleString('fa')}</p>
						</div>
						<div className={'center gap-2'}>
							{taghvim && (
								<a href={taghvim.link} target={'_blank'}>
									<Button>
										مشاهده فایل
									</Button>
								</a>
							)}
							<UploadTaghvimFile refetch={action2.refetch} taghvim={key as TaghvimType}/>
						</div>
					</div>
				);
			})}
			<br/>
			<h4>غیره</h4>
			<div className={'w-full flex flex-col gap-2'}>
				{Object.entries(SettingKeyEnum).map(([key, name]) => {
					const info = SettingKeyInfo[key as keyof typeof SettingKeyInfo];
					const defaultValue = settings?.find(s => s.key === key)?.value || info?.default;
					return (
						<form action={async (form) => {
							const json = formDataToJson(form);
							await setVar(json.key as SettingKey, (json.value || defaultValue)+"").finally(()=>{
								action3.refetch();
								router.refresh()
							})
						}} className={'flex items-end gap-2 w-full'}>
							<input hidden name={'key'} value={key}/>
							<TextInput
								name={'value'}
								label={name+` (${defaultValue})`}
								placeholder={info?.default as any}
								defaultValue={defaultValue}
							/>
							<Button type={'submit'}>
								ذخیره
							</Button>
						</form>
					)
				})}
			</div>
		</div>
	)
}

export default Page;
