import prisma from "@backend/modules/prisma/Prisma";
import {notFound} from "next/navigation";
import AllProductView from "@/app/(web)/category/all/AllProductView";
import {getAllProductCount, getProducts} from "@/app/(web)/category/all/action";
import {getVar} from "@backend/utils/setting";

const Page = async (props: any) => {
	const search = props.searchParams.query;
	const products = await getProducts(0, search);
	if (!products) {
		notFound();
		return;
	}
	const saleEnabled = (await getVar<string>("PRODUCTS_SALE_ENABLED")) !== "false";

	return (
		<div className={'container mx-auto py-10'}>
			<h3> محصولات </h3>
			<AllProductView search={search} products={products} count={await getAllProductCount(search)} saleEnabled={saleEnabled} />
		</div>
	)
}

export default Page;
