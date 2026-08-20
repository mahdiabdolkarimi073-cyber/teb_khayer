'use client';

import {Category, Prisma, Service, ServiceType} from "@prisma/client";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import ProductCategoryFindManyArgs = Prisma.ProductCategoryFindManyArgs;
import Loading from "@/app/(app)/loading";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {closeLastModal, modal} from "@/utils/modal";
import {useAction} from "@/utils/server";
import ServiceFindUniqueArgs = Prisma.ServiceFindUniqueArgs;
import PaymentButton from "@/app/(app)/app/service/[key]/PaymentButton";
import prisma from "@backend/modules/prisma/Prisma";
import ServiceUserFindFirstArgs = Prisma.ServiceUserFindFirstArgs;
import {checkVisitPay} from "@/app/(web)/showIntro/action";
import {Button} from "@mantine/core";
import {SocialsComponent} from "@/app/(web)/contact/socials";

const IntroCategories = (props: {
	categories: (Category & {children: Category[]})[]
}) => {
	let {categories: defaultCats} = props;
	const [categories, setCategories] = useState<typeof props.categories>(defaultCats)
	const [selected, setSelected] = useState<(typeof props.categories)[0]>()
	const [loading, setLoading] = useState(false)
	const router = useRouter();
	const search = useSearchParams();

	useEffect(() => {
		if (selected) {
			setLoading(true);
			handlePrismaQuery("productCategory", "findUnique", {
				where: {
					id: selected.id
				},
				include: {
					children: {
						include: {
							children: true
						},
						orderBy: {
							created_at: "asc"
						}
					}
				}
			} as ProductCategoryFindManyArgs).then(r => {
				setCategories(r?.children || []);
				router.push(`?${r.id}`)
			}).finally(()=>{
				setLoading(false);
			});
		} else setCategories(defaultCats)
 	}, [selected]);

	useEffect(() => {
		const str = search.toString();
		if (str.includes(selected?.parentId+"")) {
			setSelected({
				id: selected?.parentId
			} as any)
		} else if (!!selected && !str.includes(selected?.id+"")) {
			setSelected(undefined)
		}
	}, [search]);

	if (loading) return <Loading />

	return (
		<div className={'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:lg:grid-cols-5 flex-wrap gap-2 justify-start md:justify-evenly'}>
			{categories?.map?.(cat => (
				cat.children?.length === 0 ? (
					<Link href={`/category/${cat?.id}`} className={'block'}>
						<CatView {...cat} />
					</Link>
				):(
					<div className={'cursor-pointer'} onClick={()=>{
						if (cat.name?.includes("تخصصی")) {
							modal("آیا نیاز به مشاوره دارید؟", (
								<div className={'center justify-between items-stretch'}>
									<Button onClick={()=>{
										closeLastModal();
										modal("ویزیت آنلاین", <VisitOnlinePreview />);
									}}>
										نیاز به مشاوره دارم
									</Button>
									<Button onClick={()=>{
										closeLastModal();
										setSelected(cat);
									}}>
										خودم انتخاب میکنم
									</Button>
								</div>
							))
						} else setSelected(cat);
					}}>
						<CatView {...cat} />
					</div>
				)
			))}
		</div>
	)
}

const CatView = (props: Category) => {
	const cat = props;
	return (
		<div className={'bg-white  shadow center p-3 py-4 rounded justify-between flex-col h-full w-full'}>
			<img alt={cat.name} src={cat.thumbnail} className={'rounded-full object-cover'}
				style={{width: "100px", height: "100px"}}/>
			<p className={'text-center'}>{cat.name}</p>
		</div>
	)
}

const VisitOnlinePreview = (props: any)=>{
	const token = new URLSearchParams(window.document.cookie).get('token');
	const {result, isPending} = useAction(handlePrismaQuery, "service", "findUnique", {
		where: {
			id: "VISIT" as ServiceType
		}
	} as ServiceFindUniqueArgs);
	const service = result as Service;
	const {result: exists, isPending: l1} = useAction(checkVisitPay)

	if (isPending || l1) return <Loading />;


	console.log(exists);
	return (
		<div>
			<div dangerouslySetInnerHTML={{__html: service.beforeContent}}></div>
			<div className={'center justify-between flex-wrap'}>
				<h4>{!!service.amount ? `${service.amount.toLocaleString('fa')} تومان ` : "رایگان"}</h4>
				<PaymentButton service={service} disabled={!!exists} />
			</div>
			{exists && (
				<div className={'center flex-col gap-2 items-start'}>
					<br/>
					<div dangerouslySetInnerHTML={{__html: service.afterContent}}></div>
					<h4>راه های ارتباطی</h4>
					<div className={'center'}>
						<div className={'w-full '}>
							<SocialsComponent/>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default IntroCategories;
