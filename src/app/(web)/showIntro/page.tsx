import prisma from "@backend/modules/prisma/Prisma";
import React from "react";
import {IconLemon} from "@tabler/icons-react";
import IntroCategories from "@/app/(web)/showIntro/IntroCategories";
import {Button, TextInput} from "@mantine/core";
import {redirect} from "next/navigation";

const Page = async (props: any) => {
	const categories = await prisma.productCategory.findMany({
		where: {
			parentId: {
				equals: null
			}
		},
		include: {
			children: true
		},
		orderBy: {
			created_at: "asc"
		}
	})

	return (
		<div className={'p-2 container mx-auto md:py-10'}>
			<div className="center flex-col gap-2">
				<div className={'center gap-2 justify-center mx-'}>
					<IconLemon size={'3rem'} className={'text-primary'}/>
					<div>
						<h1 className={'text-xl'}>محصولات گیاهی</h1>
						<p>فروش انواع محصولات گیاهی</p>
					</div>
				</div>
				<form className={'center rounded overflow-hidden gap-1'} action={async (formData)=>{
					'use server';
					redirect(`/category/all?query=${encodeURIComponent(formData.get('query')+"")}`)
				}}>
					<TextInput
						required
						name={'query'}
						placeholder={'نام دارو یا بیماری...'}
					/>
					<Button  type={'submit'}>
						جستجو
					</Button>
				</form>
			</div>
			<hr className={'my-4'}/>
			<IntroCategories categories={categories}/>
		</div>
	)
}

export default Page;
