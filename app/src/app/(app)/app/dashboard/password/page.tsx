"use client";

import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {useAction} from "@/utils/server";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {Button, PasswordInput} from "@mantine/core";
import {User} from "@prisma/client";
import {useRouter} from "next/navigation";
import React from "react";

const Page = (props: any) => {
	const {result: user} = useAction(getUserFromCookie);
	const router = useRouter();

	return (
		<div className={'min-h-screen center flex-col items-stretch p-2 gap-3' }>
			<h3>تغییر رمزعبور</h3>
			<form action={async (form: FormData) => {
				const p1 = form.get('password');
				const p2 = form.get('repeat');

				if (p1 !== p2) {
					alert("رمز های عبور یکسان نیست");
					return;
				}

				await handlePrismaQuery("user", 'update', {
					where: {
						id: user?.id
					},
					data: {
						password: p1+""
					}
				});
				alert("رمزعبور تغییر یافت")
				router.back();
			}} className={'center items-stretch flex-col gap-3'}>
				<PasswordInput
					name={'password'}
					label={'رمزعبور جدید'}
					required
				/>
				<PasswordInput
					name={'repeat'}
					label={'تکرار رمزعبور'}
					required
				/>
				<div>
					<Button type={'submit'}>
						تغییر
					</Button>
				</div>
			</form>
		</div>
	)
}

export default Page;
