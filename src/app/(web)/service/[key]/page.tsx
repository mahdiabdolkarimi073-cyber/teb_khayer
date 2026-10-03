import prisma from "@backend/modules/prisma/Prisma";
import {notFound} from "next/navigation";
import ServiceTypeEnum from "@/generated/ServiceType.enum";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React from "react";
import PaymentButton from "@/app/(app)/app/service/[key]/PaymentButton";
import {SocialsComponent} from "@/app/(web)/contact/socials";
import ServiceHero from "@/components/service/ServiceHero";

const Page = async (props: any) => {
	const service = await prisma.service.findUnique({
		where: {
			id: props?.params?.key
		}
	});
	if (!service) {
		notFound();
	}

	const user = await getUserFromCookie();
	const exists = user ? await prisma.serviceUser.findFirst({
		where: {
			serviceId: service.id,
			userId: user.id
		}
	}) : null;
	const name = ServiceTypeEnum[service.id]

	return (
		<div className={'max-w-[1000px] mx-auto px-4 py-6'}>
			<ServiceHero title={name} serviceKey={service.id} />
			<div className={'max-w-[700px] mx-auto py-10'}>
				<div dangerouslySetInnerHTML={{__html: service.beforeContent}}></div>
				<div className={'center justify-between flex-wrap gap-4 mt-6'}>
					<h4>{!!service.amount ? `${service.amount.toLocaleString('fa')} تومان` : "رایگان"}</h4>
					<PaymentButton service={service} disabled={!!exists} />
				</div>
				{exists && (
					<div className={'center flex-col gap-2 items-start mt-8'}>
						<div dangerouslySetInnerHTML={{__html: service.afterContent}}></div>
						<h4>راه های ارتباطی</h4>
						<div className={'scale-125'}>
							<SocialsComponent />
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export const generateMetadata = (props: any)=>{
	return {
		title: ServiceTypeEnum[props?.params?.key as keyof typeof  ServiceTypeEnum]
	}
}

export default Page;
