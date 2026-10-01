'use server';

import {ServiceType} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";

export async function getServiceDetails(key: ServiceType) {
	return prisma.service.upsert({
		where: {
			id: key
		},
		create: {
			id: key,
			amount: 0
		},
		update: {},
		include: {
			users: {
				include: {
					user: true
				}
			}
		}
	})
}
