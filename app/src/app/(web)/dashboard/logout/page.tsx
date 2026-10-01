

import {Button} from "@mantine/core";
import {cookies} from "next/headers";

const Page = (props: any) => {

	return (
		<div className={'center flex-wrap gap-2'}>
			<p>آیا میخواهید خارج شوید؟</p>
			<form action={async ()=>{
				"use server";

				cookies().delete("token");
			}}>
				<Button type={'submit'} size={'xs'} color={'red'}>
					خروج
				</Button>
			</form>
		</div>
	)
}

export default Page;
