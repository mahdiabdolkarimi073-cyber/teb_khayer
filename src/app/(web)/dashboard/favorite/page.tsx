import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import ProductCard from "@/app/(web)/ProductCard";
import {IconInfoCircle} from "@tabler/icons-react";

const Page = async (props: any) => {
	const user = await getUserFromCookie();
	const likes = await prisma.productLike.findMany({
		where: {
			userId: user?.id
		},
		include: {
			product: true
		}
	});


	return (
		<div>
			<h3>علاقه مندی ها</h3>
			<br/>

			<div className={'grid md:grid-cols-1 lg:grid-cols-2 p-2 gap-2'}>
				{!likes?.length && (
					<div className={'center justify-start gap-2'}>
						<IconInfoCircle size={'2rem'} className={'text-red-400'} />
						<p className={'font-bold text-xl'}>موردی یافت نشد</p>
					</div>
				)}
				{likes?.map?.(l => l?.product)?.map?.(product => <ProductCard product={product}/>)}
			</div>
		</div>
	)
}

export default Page;
