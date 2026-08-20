'use server';


import prisma from "@backend/modules/prisma/Prisma";

export async function getAllProductCount(search: undefined | string = undefined) {
	return await prisma.product.count({
		where: {
			...(search && ({
				name: {
					contains: search
				},
				description_text: {
					contains: search
				}
			}))
		}
	});
}

export async function getProducts(skip = 0, search: string | undefined = undefined, take?: number) {
	return await prisma.product.findMany({
		take: take || 10,
		skip,
		where: {
			...(search && ({
				OR: [
					{
						name: {
							contains: search
						}
					},
					{
						description_text: {
							contains: search
						}
					}
				]
			}))
		}
	})
}
