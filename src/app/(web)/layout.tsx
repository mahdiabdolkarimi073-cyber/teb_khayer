import React from "react";
import WebHeader from "@/app/(web)/WebHeader";
import WebFooter from "@/app/(web)/WebFooter";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {User} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import ShopLatestUpdate from "@/app/(web)/ShopLatestUpdate";
import WebMobileNav from "@/app/(web)/WebMobileNav";
import {getVar} from "@backend/utils/setting";

const Layout = async (props: any) => {
	const categories = await prisma.productCategory.findMany({
		include: {
			products: {
				take: 3
			}
		}
	});


	return (
		<div className={'bg-gray-100 relative'}>
			<script dangerouslySetInnerHTML={{
				__html: `
			window.isApplication = false;
			`
			}}></script>
			<ShopLatestUpdate/>
			<WebHeader
				phone={await getVar('MAIN_PHONE')}
				user={await getUserFromCookie() as User}
					 categories={categories?.filter?.(c => !!c?.products?.length)}/>
			{props.children}
			<WebFooter/>
			<div className={'sticky bottom-0 sm:hidden  z-20'}>
				<WebMobileNav/>
			</div>
		</div>
	)
}

export default Layout;
