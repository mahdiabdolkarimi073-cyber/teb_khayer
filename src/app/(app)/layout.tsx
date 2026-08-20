import React, {Suspense} from "react";
import AppHeader from "@/app/(app)/AppHeader";
import MobileNav from "@/app/(app)/MobileNav";
import PageLoader from "@/components/ui/PageLoader";
import AppStoreTypeSetter from "@/app/(app)/AppStoreTypeSetter";

const Layout = (props: any) => {

	return (
		<body className={'app'}>
		<div className={'relative min-h-screen bg-gray-100 safe'}>
			<script dangerouslySetInnerHTML={{
				__html: `
			window.isApplication = true;
			`
			}}></script>
			<AppStoreTypeSetter />
			<AppHeader/>
			<PageLoader>
				{props.children}
			</PageLoader>
			<div className={'h-[80px] w-full'}>

			</div>
			<MobileNav/>
		</div>
		</body>
	)
}

export default Layout;
