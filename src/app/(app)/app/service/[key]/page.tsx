import prisma from "@backend/modules/prisma/Prisma";
import {notFound, redirect} from "next/navigation";
import ServiceTypeEnum from "@/generated/ServiceType.enum";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React from "react";
import {Button} from "@mantine/core";
import PaymentButton from "@/app/(app)/app/service/[key]/PaymentButton";
import {SocialsComponent} from "@/app/(web)/contact/socials";

const Page = async (props: any) => {
	const user = await getUserFromCookie();
	const service = await prisma.service.findUnique({
		where: {
			id: props?.params?.key
		}
	});
	if (!user) {
		redirect("/app/login");
	}
	if (!service) {
		notFound();
	}
	const exists = await prisma.serviceUser.findFirst({
		where: {
			serviceId: service.id,
			userId: user.id
		}
	})
	const name = ServiceTypeEnum[service.id]

	return (
		<div className={'p-4'}>
			<div dangerouslySetInnerHTML={{__html: service.beforeContent}}></div>
			<div className={'center justify-between flex-wrap'}>
				<h4>{!!service.amount ?`${service.amount.toLocaleString('fa')} تومان `:"رایگان"}</h4>
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

export const generateMetadata = (props: any) => {
	return {
		title: ServiceTypeEnum[props?.params?.key as keyof typeof  ServiceTypeEnum]
	}
}

export default Page;
