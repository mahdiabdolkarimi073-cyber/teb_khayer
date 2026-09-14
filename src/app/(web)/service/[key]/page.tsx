import prisma from "@backend/modules/prisma/Prisma";
import {notFound, redirect} from "next/navigation";
import ServiceTypeEnum from "@/generated/ServiceType.enum";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React from "react";
import {Button} from "@mantine/core";
import PaymentButton from "@/app/(app)/app/service/[key]/PaymentButton";
import {SocialsComponent} from "@/app/(web)/contact/socials";

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
		<div className={'p-2 max-w-[700px] mx-auto center flex-col py-10'}>
			<h1 className={'whitespace-pre-line text-center text-xl font-bold mb-6'}>{name}</h1>
				<div dangerouslySetInnerHTML={{__html: service.afterContent}}></div>
			<h4>راه های ارتباطی</h4>
			<div className={'scale-125'}>
				<SocialsComponent />
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
