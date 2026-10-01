import prisma from "@backend/modules/prisma/Prisma";
import {notFound} from "next/navigation";
import React from "react";
import NewProduct from "@/app/(web)/admin/products/new/page";

const Page = async (props: any) => {
	const id = props?.params?.id;
	const product = await prisma.product.findUnique({
		where: {
			id
		}
	});

	if (!product) {
		notFound();
		return null;
	}

	return <NewProduct Product={product} searchParams={{}}/>
}

export default Page;
