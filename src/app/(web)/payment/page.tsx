import {IconCheck, IconX} from "@tabler/icons-react";
import {Button} from "@mantine/core";
import React from "react";
import Link from "next/link";

const Page = (props: any) => {
	const {status: statusText, msg = "خطا در پرداخت", redirect = '/dashboard/orders'} = props?.searchParams;
	const status = statusText === 'true';
	const Icon = status ? IconCheck:IconX;

	return (
		<div className={'center p-2 gap-2 flex-col min-h-[400px]'}>
			<Icon size={'7rem'} color={status ? "green":"red"} />
			<h3 className={status ? "text-green-400":"text-red-400"}>{msg}</h3>
			<Link href={redirect}>
				<Button color={status ? "green":"red"}>
					هدایت
				</Button>
			</Link>
		</div>
	)
}

export default Page;
