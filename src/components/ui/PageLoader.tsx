"use client";

import {usePageLoading} from "@/app/OverrideWindow";
import Loading from "@/app/(app)/loading";
import {useEffect} from "react";

const PageLoader = (props: any) => {
	const loading = usePageLoading();


	return (
		<>
			{loading && (
				<div className={'fixed h-full w-full left-0 top-0 bg-white z-10'}>
					<Loading />
				</div>
			)}
			{props?.children}
		</>
	)
}

export default PageLoader;
