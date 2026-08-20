import prisma from "@backend/modules/prisma/Prisma";
import {ServiceType} from "@prisma/client";
import ServiceTypeEnum from "@/generated/ServiceType.enum";
import ServiceManagement from "@/app/(web)/admin/services/[service]/ServiceManagement";
import React from "react";
import Link from "next/link";
import {Button} from "@mantine/core";

export const revalidate = 0

const Page = async (props: any) => {
    const ServiceKey = props.params?.service as ServiceType;
    const service = await prisma.service.upsert({
        where: {
            id: ServiceKey
        },
        create: {
            id: ServiceKey,
            amount: 0
        },
        update: {

        }
    });


    const name = ServiceTypeEnum[ServiceKey] || ""

	return (
		<div>
			<div className={'center justify-between'}>
				<h4>{name}</h4>
				<Link href={`./${service.id}/list`}>
					<Button>
						مشاهده کاربران
					</Button>
				</Link>
			</div>
			<hr className={'my-2'}/>
			<ServiceManagement service={service} />
		</div>
	)
}

export default Page;
