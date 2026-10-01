'use server'

import {ServiceType} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import {setVar} from "@backend/utils/setting";

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

export async function updateSetting(key: string, value: string) {
	await setVar(key, value);
}
