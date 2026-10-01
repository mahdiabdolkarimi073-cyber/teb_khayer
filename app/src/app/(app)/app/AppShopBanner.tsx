"use client";

import React from "react";
import {IconClock, IconGardenCart} from "@tabler/icons-react";

const AppShopBanner = (props: any) => {


	return (
		<a href={"/showIntro"} target={'_blank'}>
			<div
				className={'h-[100px] rounded-2xl flex-grow overflow-hidden justify-start relative center text-white bg-gradient'}>
				<div className={'bg-gradient-to-tl shadow-inner from-black/10 to-black/50 absolute w-full h-full top-0 left-0'}></div>
				<div className={'center w-full p-1 relative z-10 gap-2'}>
					<div className={'center flex-col gap-1'}>
						<p className={'text-[12px] font-bold text-center'}>فروشگاه محصولات گیاهی</p>
						<p className={'text-[10px] text-center'}>جهت مشاهده فروشگاه کلیک کنید</p>
					</div>
				</div>
			</div>

		</a>
	)
}

export default AppShopBanner;
