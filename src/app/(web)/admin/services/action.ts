'use server'

import {ServiceType} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";

export async function setServiceDisabled(serviceId: ServiceType, disabled: boolean) {
	await prisma.service.update({
		where: {
			id: serviceId
		},
		data: {
			disabled
		}
	})
}
