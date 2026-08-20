import prisma from "@backend/modules/prisma/Prisma";
import {notFound} from "next/navigation";
import AllProductView from "@/app/(web)/category/all/AllProductView";
import {getAllProductCount, getProducts} from "@/app/(web)/category/all/action";

const Page = async (props: any) => {
	const search = props.searchParams.query;
	const products = await getProducts(0, search);
	if (!products) {
		notFound();
		return;
	}

	return (
		<div className={'container mx-auto py-10'}>
			<h3> محصولات </h3>
			<AllProductView search={search} products={products} count={await getAllProductCount(search)} />
		</div>
	)
}

export default Page;
