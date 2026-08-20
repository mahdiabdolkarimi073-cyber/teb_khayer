import AppConfig from "@/config/AppConfig";
import React from "react";
import Link from "next/link";

const EitaaBanner = (props: any) => {


	return (
		<a target={'_blank'} href={AppConfig.contact.eitaa} className={'flex-grow'}>
			<div className={'bg-gradient-to-tl shadow-inner p-3 h-[100px] w-full from-orange-500 to-orange-400 rounded-2xl overflow-hidden  center flex-col text-white gap-1'}>
				<img loading='lazy' src={'/banners/eitaa.webp'} alt={'Eitaa'} className={'w-[50px] drop-shadow'}/>
				<p>گروه پرسش و پاسخ پزشکی در ایتا</p>
			</div>
		</a>
	)
}

export default EitaaBanner;
