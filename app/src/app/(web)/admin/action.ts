"use server";
import prisma from "@backend/modules/prisma/Prisma";
import {Prisma} from "@prisma/client";
import PrismaAction = Prisma.PrismaAction;
import {updateFile} from "@backend/utils/file";

export async function handlePrismaQuery<T = any, T2 = any>(
	table: keyof typeof prisma,
	action: PrismaAction,
	query: T
): Promise<T2> {
	// @ts-ignore
	return await prisma[table][action](query);
}

export async function handleModelPosition(
	modelName: keyof typeof prisma,
	id: string,
	action: "up" | "down",
	condition: any = {}
) {
	try {
		const prismaHandler = prisma[modelName] as typeof prisma.course;
		const models = await prismaHandler?.findMany({
			...condition && ({
				where: condition,
			}),
			orderBy: {
				created_at: "asc",
			},
			select: {
				id: true,
				created_at: true,
				name: true
			},
		});
		const targetIndex = models.findIndex((m) => m?.id === id);
		const current = models[targetIndex];
		if (!current) {
			console.log("CURRENT NOT FOUND", id, models, targetIndex, current);
			return;
		}

		if (action === "up") {
			const previous = models[targetIndex -1] || current;
			const previous2 = models[targetIndex - 2] || previous;

			const date = new Date(Math.round((previous.created_at.getTime() + previous2.created_at.getTime()) / 2) - 5);

			console.log(targetIndex,previous.name, previous2.name, condition)

			await prismaHandler.update({
				where: {
					id: current?.id,
				},
				data: {
					created_at: date,
				},
			});
		} else {
			const next = models[targetIndex + 1] || current;
			const next2 = models[targetIndex + 2] || next;

			const date = new Date(Math.round((next.created_at.getTime() + next2.created_at.getTime()) / 2) + 5);

			console.log(targetIndex,next.name, next2.name, condition)

			await prismaHandler.update({
				where: {
					id: current?.id,
				},
				data: {
					created_at: date,
				},
			});
		}

		console.log("DONE", action, id);
	} catch (e) {
		console.error(e);
	}
}

{
	/*

	// mine code

   "use server";

   import prisma from "@backend/modules/prisma/Prisma";
   import { Prisma } from "@prisma/client";
   import PrismaAction = Prisma.PrismaAction;
   import { updateFile } from "@backend/utils/file";

   export async function handlePrismaQuery<T = any, T2 = any>(
	table: keyof typeof prisma,
	action: PrismaAction,
	query: T
   ): Promise<T2> {
	// @ts-ignore
	return await prisma[table][action](query);
   }

   export async function handleModelPosition(
	modelName: keyof typeof prisma,
	id: string,
	action: "up" | "down"
   ) {
	try {
	  const prismaHandler = prisma[modelName] as typeof prisma.course;
	  const models = await prismaHandler?.findMany({
	    orderBy: {
		 created_at: "asc",
	    },
	    select: {
		 id: true,
		 created_at: true,
	    },
	  });

	  const targetIndex = models.findIndex((m) => m?.id === id);
	  const current = models[targetIndex];
	  if (!current) {
	    console.log("CURRENT NOT FOUND", id, models, targetIndex, current);
	    return;
	  }

	  if (action === "up") {
	    const previous = models[targetIndex - 1];
	    if (!previous) {
		 console.log("PREVIOUS NOT FOUND");
		 return;
	    }


	    await prismaHandler.update({
		 where: { id: current?.id },
		 data: { created_at: previous.created_at },
	    });

	    await prismaHandler.update({
		 where: { id: previous.id },
		 data: { created_at: current.created_at },
	    });
	  } else {
	    const next = models[targetIndex + 1];
	    if (!next) {
		 console.log("NEXT NOT FOUND");
		 return;
	    }


	    await prismaHandler.update({
		 where: { id: current?.id },
		 data: { created_at: next.created_at },
	    });

	    await prismaHandler.update({
		 where: { id: next.id },
		 data: { created_at: current.created_at },
	    });
	  }

	  console.log("DONE", action, id);
	} catch (e) {
	  console.error(e);
	}
   }*/
}
