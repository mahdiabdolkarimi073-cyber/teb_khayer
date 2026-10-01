import prisma from "@backend/modules/prisma/Prisma";

const ShopLatestUpdate = async (props: any) => {
    const lastUpdatedProduct = await prisma.product.findMany({
        orderBy: {
            updated_at: 'desc'
        },
        take: 1
    });
    const date = new Date(lastUpdatedProduct?.[0]?.updated_at || "")

	return (
		<div className={'bg-orange-400 text-white text-center p-2 w-full'}>
			موجودی و قیمت ها در تاریخ {(<span className={'font-bold'}>{date.toLocaleDateString('fa')}</span>)} بروز شده اند
		</div>
	)
}

export default ShopLatestUpdate;
