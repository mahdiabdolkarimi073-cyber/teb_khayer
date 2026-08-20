"use client";
 import React, {useEffect, useRef} from "react";
import {Button} from "@mantine/core";
import Link from "next/link";

const Page = (props: any) => {
	const link = useRef<any>();

	useEffect(()=>{
		link?.current?.click?.();
	}, [link, link?.current])

	return (
		<div className={'center h-screen flex-col gap-2'}>
			<Button component={Link} href={'/'} target={'_blank'} ref={link}>ورود به فروشگاه</Button>
		</div>
	)
}

export const dynamic = "force-dynamic"

export default Page;
