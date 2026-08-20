"use client";

import {IconAlertCircle} from "@tabler/icons-react";
import {Button} from "@mantine/core";
import {useRouter, useSearchParams} from "next/navigation";

const NotFound = (props: any) => {
	const router = useRouter();
	const params = useSearchParams();

	return (
		<div className={'h-screen center flex-col gap-2'}>
			<h1 className={'text-red-400 text-8xl'}><IconAlertCircle size={'10rem'} /></h1>
			<h3 className={'text-5xl'}>خطا!</h3>
			<h2>{params?.get('msg') || "با پشتیبانی در ارتباط باشید"}</h2>
			<Button onClick={()=>{
				router.back();
			}}>
				بازگشت
			</Button>
		</div>
	)
}

export default NotFound;
