import prisma from "@backend/modules/prisma/Prisma";
import {notFound, redirect} from "next/navigation";
import ServiceTypeEnum from "@/generated/ServiceType.enum";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React from "react";
import {Button} from "@mantine/core";
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
	const name = ServiceTypeEnum[service.id]

	return (
		<div className={'max-w-[1000px] mx-auto px-4 py-6'}>
			<ServiceHero title={name} serviceKey={service.id} />
			<div className={'max-w-[700px] mx-auto center flex-col py-10'}>
				<div dangerouslySetInnerHTML={{__html: service.afterContent}}></div>
				<h4>راه های ارتباطی</h4>
				<div className={'scale-125'}>
					<SocialsComponent />
				</div>
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
