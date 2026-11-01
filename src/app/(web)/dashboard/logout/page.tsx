

import {Button} from "@mantine/core";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

const Page = (props: any) => {

	return (
		<div className={'flex flex-col items-center justify-center p-6 text-center gap-4 bg-white rounded-2xl border border-gray-200 max-w-md mx-auto shadow-sm my-6'} dir="rtl">
			<h2 className="text-base font-bold text-gray-900">خروج از حساب کاربری</h2>
			<p className="text-sm text-gray-600">آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟</p>
			<p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
				✓ اقلام موجود در سبد خرید شما حفظ خواهند شد و حذف نمی‌شوند.
			</p>
			<form action={async ()=>{
				"use server";

				cookies().delete("token");
				redirect("/");
			}} className="mt-2">
				<Button type={'submit'} size={'sm'} color={'red'}>
					تأیید و خروج از حساب
				</Button>
			</form>
		</div>
	)
}

export default Page;
