import {
	IconBook,
	IconChevronRight,
	IconDoorExit,
	IconGauge,
	IconHeart,
	IconKey, IconLogout,
	IconPassword,
	IconUser
} from "@tabler/icons-react";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React from "react";
import {Button, NavLink} from "@mantine/core";
import Link from "next/link";
import {cookies} from "next/headers";

const Page = async (props: any) => {
	const user = await getUserFromCookie();

	return (
		<div className={'min-h-screen center flex-col gap-2'}>
			<div className={'bg-primary text-white rounded-full p-3'}>
				<IconUser size={'7rem'} />
			</div>
			<h3>{user?.name}</h3>
			<div>
				<NavLink
					component={Link}
					href="/app/dashboard/likes"
					label="لیست علاقه مندی های من"
					leftSection={<IconHeart size="1.5rem" stroke={1.5} />}
					rightSection={
						<IconChevronRight size="1rem" stroke={1.5} className="mantine-rotate-rtl" />
					}
				/>
				<NavLink
					component={Link}
					href="/app/dashboard/courses"
					label="لیست دوره های من"
					leftSection={<IconBook size="1.5rem" stroke={1.5} />}
					rightSection={
						<IconChevronRight size="1rem" stroke={1.5} className="mantine-rotate-rtl" />
					}
				/>
				<NavLink
					component={Link}
					href="/app/dashboard/password"
					label="تغییر رمزعبور"
					leftSection={<IconKey size="1.5rem" stroke={1.5} />}
					rightSection={
						<IconChevronRight size="1rem" stroke={1.5} className="mantine-rotate-rtl" />
					}
				/>
				<form action={async ()=>{
					'use server';

					cookies().delete("token");
				}} className={'w-full block'}>
					<NavLink
						component={Button}
						// @ts-ignore
						type={'submit'}
						className={'w-full'}
						href="/app/dashboard/password"
						label="خروج"
						color={'red'}
						leftSection={<IconLogout size="1.5rem" stroke={1.5} />}
					/>
				</form>
			</div>
		</div>
	)
}

export const metadata = {
	title: "حساب کاربری من"
}

export default Page;
