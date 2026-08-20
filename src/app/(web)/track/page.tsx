import React from "react";
import TrackProduct from "@/app/(web)/track/TrackProduct";

const Page = (props: any) => {

	return (
		<div className={'center container mx-auto md:p-4 p-2 flex-col gap-5'}>
			<img src={'/design/track.png'} style={{width: "200px", height: '200px'}} alt={'پیگیری محصولات'} />
			<p className={'text-sm'}>
				براى پيگيرى محصول، لطفا شماره سفارش وشماره تلفن خودرا دركادرهاى زيرواردكرده و دكمه پيگيرى رافشاردهيد .
				(شماره سفارش، قبلاازطريق رسيد پيامكى به شماره شما ارسال شده است)
			</p>
			<TrackProduct />
		</div>
	)
}

export default Page;
