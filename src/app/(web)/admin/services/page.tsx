'use client';

import ServiceTypeEnum from "@/generated/ServiceType.enum";
import {Button, Switch, TextInput, Select} from "@mantine/core";
import React, {FormEvent, useState} from "react";
import Link from "next/link";
import TaghvimTypeEnum from "@/generated/TaghvimType.enum";
import {Service, ServiceType, Setting, Taghvim, TaghvimType} from "@prisma/client";
import UploadTaghvimFile from "@/app/(web)/admin/services/UploadTaghvimFile";
import JalaliDatePicker from "@/app/(web)/admin/services/JalaliDatePicker";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {useAction} from "@/utils/server";
import Loading from "@/app/(app)/loading";
import {createDiscountCode, deleteDiscountCode, getDiscountCodes, setServiceDisabled, updateDiscountCode, updateSetting} from "@/app/(web)/admin/services/action";
import {useRouter} from "next/navigation";
import SettingKeyEnum, {SettingKeyInfo} from "@/generated/SettingKey.enum";
import {formDataToJson} from "@/utils/other";
import {formatJalaliDate, formatJalaliDateShort} from "@/utils/format";

type DiscountForm = {
	code: string;
	type: "PERCENTAGE" | "FIXED";
	value: string;
	expiresAt: string;
	active: boolean;
};

const emptyDiscountForm: DiscountForm = {
	code: "",
	type: "PERCENTAGE",
	value: "",
	expiresAt: "",
	active: true,
};

const Page = () => {
	const action = useAction(handlePrismaQuery, "service", 'findMany');
	const action2 = useAction(handlePrismaQuery, "taghvim", 'findMany');
	const action3 = useAction(handlePrismaQuery, "setting", 'findMany');
	const discountsAction = useAction(getDiscountCodes);
	const router = useRouter();
	const [discountForm, setDiscountForm] = useState<DiscountForm>(emptyDiscountForm);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [discountError, setDiscountError] = useState("");
	const [discountMessage, setDiscountMessage] = useState("");

	if (action.isPending || action2.isPending || action3.isPending || discountsAction.isPending) return <Loading/>;

	const services = action.result as Service[];
	const taghvims = action2.result as Taghvim[];
	const settings = (action3.result || []) as Setting[];
	const discounts = discountsAction.result || [];

	const resetDiscountForm = () => {
		setDiscountForm(emptyDiscountForm);
		setEditingId(null);
	};

	const submitDiscount = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setDiscountError("");
		setDiscountMessage("");
		try {
			if (editingId) {
				await updateDiscountCode({id: editingId, ...discountForm});
				setDiscountMessage("کد تخفیف ویرایش شد");
			} else {
				await createDiscountCode(discountForm);
				setDiscountMessage("کد تخفیف ایجاد شد");
			}
			resetDiscountForm();
			discountsAction.refetch();
		} catch (error) {
			setDiscountError(error instanceof Error ? error.message : "ذخیره کد تخفیف انجام نشد");
		}
	};

	const editDiscount = (discount: typeof discounts[number]) => {
		setEditingId(discount.id);
		setDiscountForm({
			code: discount.code,
			type: discount.type,
			value: String(discount.value),
			expiresAt: discount.expiresAt ? formatJalaliDateShort(discount.expiresAt) : "",
			active: discount.active,
		});
		setDiscountError("");
		setDiscountMessage("");
	};

	const removeDiscount = async (id: string) => {
		if (!window.confirm("این کد تخفیف حذف شود؟")) return;
		try {
			await deleteDiscountCode(id);
			discountsAction.refetch();
		} catch (error) {
			setDiscountError(error instanceof Error ? error.message : "حذف کد تخفیف انجام نشد");
		}
	};

	return (
		<div className={'center flex-col gap-2'}>
			<h4>خدمات</h4>
			<hr className={'my-1 w-full'}/>
			{Object.entries(ServiceTypeEnum).map(([key, name]) => {
				const service = services.find(c => c.id === key);
				return (
					<div className={'center justify-between w-full gap-2 flex-wrap border p-2 rounded-lg'} key={key}>
						<h5 className={'whitespace-pre-line text-right'}>{name}</h5>
						<div className={'center gap-1'}>
							<Link href={`/admin/services/${key}`}><Button size={'xs'}>مدیریت</Button></Link>
							<Button onClick={() => setServiceDisabled(key as ServiceType, !service?.disabled).finally(action.refetch)} type={'submit'} color={service?.disabled ? "green" : "red"} size={'xs'}>
								{service?.disabled ? "فعال" : "غیرفعال"} سازی
							</Button>
						</div>
					</div>
				);
			})}
			<br/>
			<h4>تقویم ها</h4>
			<hr className={'my-1 w-full'}/>
			{Object.entries(TaghvimTypeEnum).map(([key, name]) => {
				const taghvim = taghvims?.find?.(c => c?.id === key);
				return (
					<div className={'center justify-between w-full border p-2 rounded-lg'} key={key}>
						<div><h5 className={'whitespace-pre-line text-right'}>{name}</h5><p>{taghvim?.updated_at && new Date(taghvim.updated_at).toLocaleString('fa')}</p></div>
						<div className={'center gap-2'}>
							{taghvim && <a href={taghvim.link} target={'_blank'} rel="noreferrer"><Button>مشاهده فایل</Button></a>}
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
					const isBoolean = info?.default === "true" || info?.default === "false";
					const checked = (defaultValue + "").toLowerCase() === "true";
					return (
						<form action={async (form) => {
							const json = formDataToJson(form);
							await updateSetting(json.key, (json.value || defaultValue)+"").finally(() => { action3.refetch(); router.refresh(); });
						}} className={'flex items-end gap-2 w-full'} key={key}>
							<input hidden name={'key'} value={key} readOnly/>
							{isBoolean ? <>
								<input hidden name={'value'} value={checked ? "true" : "false"} readOnly/>
								<Switch label={name} defaultChecked={checked} onChange={(e) => updateSetting(key, e.currentTarget.checked ? "true" : "false").finally(() => { action3.refetch(); router.refresh(); })}/>
							</> : <>
								<TextInput name={'value'} label={name+` (${defaultValue})`} placeholder={info?.default as string} defaultValue={defaultValue as string}/>
								<Button type={'submit'}>ذخیره</Button>
							</>}
						</form>
					);
				})}
			</div>

			<section className="w-full border rounded-lg p-3 mt-4">
				<h4>کدهای تخفیف</h4>
				<p className="text-sm text-gray-500">کد تخفیف می‌تواند درصدی یا مبلغ ثابت باشد.</p>
				<form onSubmit={submitDiscount} className="flex flex-wrap items-end gap-2 mt-3">
					<TextInput label="کد" placeholder="مثلاً SUMMER1405" value={discountForm.code} onChange={(event) => setDiscountForm({...discountForm, code: event.currentTarget.value})} required/>
					<Select label="نوع" data={[{value: "PERCENTAGE", label: "درصدی"}, {value: "FIXED", label: "مبلغ ثابت"}]} value={discountForm.type} onChange={(value) => setDiscountForm({...discountForm, type: value as DiscountForm["type"]})} required/>
					<TextInput label={discountForm.type === "PERCENTAGE" ? "درصد" : "مبلغ (تومان)"} type="number" min={1} max={discountForm.type === "PERCENTAGE" ? 100 : undefined} value={discountForm.value} onChange={(event) => setDiscountForm({...discountForm, value: event.currentTarget.value})} required/>
					<JalaliDatePicker label="تاریخ انقضا" placeholder="انتخاب تاریخ" value={discountForm.expiresAt} onChange={(val) => setDiscountForm({...discountForm, expiresAt: val})}/>
					{editingId && <Switch label="فعال" checked={discountForm.active} onChange={(event) => setDiscountForm({...discountForm, active: event.currentTarget.checked})}/>} 
					<Button type="submit">{editingId ? "ذخیره ویرایش" : "افزودن کد"}</Button>
					{editingId && <Button type="button" variant="default" onClick={resetDiscountForm}>انصراف</Button>}
				</form>
				{discountError && <p className="text-red-600 text-sm mt-2">{discountError}</p>}
				{discountMessage && <p className="text-green-600 text-sm mt-2">{discountMessage}</p>}
				<div className="overflow-x-auto mt-4">
					<table className="w-full text-sm text-right">
						<thead><tr><th className="p-2">کد</th><th className="p-2">مقدار</th><th className="p-2">انقضا</th><th className="p-2">وضعیت</th><th className="p-2">عملیات</th></tr></thead>
						<tbody>{discounts.map((discount) => <tr key={discount.id} className="border-t">
							<td className="p-2 font-bold">{discount.code}</td>
							<td className="p-2">{discount.type === "PERCENTAGE" ? `${discount.value}%` : `${discount.value.toLocaleString("fa-IR")} تومان`}</td>
							<td className="p-2">{discount.expiresAt ? formatJalaliDate(discount.expiresAt) : "بدون انقضا"}</td>
							<td className="p-2">{discount.active ? "فعال" : "غیرفعال"}</td>
							<td className="p-2"><Button size="xs" onClick={() => editDiscount(discount)}>ویرایش</Button>{" "}<Button size="xs" color="red" onClick={() => removeDiscount(discount.id)}>حذف</Button></td>
						</tr>)}</tbody>
					</table>
					{!discounts.length && <p className="text-center text-gray-500 p-4">هنوز کدی ثبت نشده است.</p>}
				</div>
			</section>
		</div>
	)
}

export default Page;
