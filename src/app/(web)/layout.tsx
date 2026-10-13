export const dynamic = 'force-dynamic';

import React from "react";
import WebHeader from "@/app/(web)/WebHeader";
import WebFooter from "@/app/(web)/WebFooter";
import VpnWarning from "@/app/(web)/VpnWarning";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {User} from "@prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import ShopLatestUpdate from "@/app/(web)/ShopLatestUpdate";
import WebMobileNav from "@/app/(web)/WebMobileNav";
import VisitTracker from "@/app/(web)/VisitTracker";
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
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('/sw.js').then(function(reg) {
					if (reg.waiting) {
						reg.waiting.postMessage('SKIP_WAITING');
					}
					reg.addEventListener('updatefound', function() {
						var nw = reg.installing;
						if (!nw) return;
						nw.addEventListener('statechange', function() {
							if (nw.state === 'installed' && navigator.serviceWorker.controller) {
								nw.postMessage('SKIP_WAITING');
							}
						});
					});
				});
				navigator.serviceWorker.addEventListener('controllerchange', function() {
					window.location.reload();
				});
			}
			`
			}}></script>
			<VpnWarning/>
		<ShopLatestUpdate/>
			<VisitTracker/>
			<WebHeader
				phone={await getVar<string>('MAIN_PHONE')}
				freeShippingThreshold={await getVar<string>('FREE_SHIPPING_THRESHOLD')}
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
