"use client";

import AppConfig from "@/config/AppConfig";
import React from "react";
import Link from "next/link";
import {Swiper, SwiperSlide} from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import {Autoplay, EffectCards, EffectFlip} from "swiper/modules";

const AppMainBanner = (props: any) => {

	return (
		<Link href={'/app/welcome'}>
			<div className={'relative overflow-hidden'}>
				<Swiper
					spaceBetween={50}
					slidesPerView={1}
					loop
					draggable
					speed={1000}
					autoplay={{
						delay: 3000,
						waitForTransition: true
					}}
					modules={[Autoplay]}
					effect="slide"
				>
					<SwiperSlide>
						<div className={'h-[180px] relative bg-gradient-to-tl from-primary to-secondary py-2 rounded-3xl center justify-between text-white gap-2 p-4 overflow-hidden'}>
							<div className={'flex-grow flex-wrap w-full center flex-col h-full gap-2 min-w-0'}>
								<img loading='lazy' src={'/logo.webp'} alt={AppConfig.name} className={'w-[50px] shrink-0'}/>
								<div className={'center flex-col min-w-0'}>
									<h3 className="text-center">بهزاد خیّر هستم</h3>
									<h2 className={'text-2xl sm:text-[33px] text-center'}>طبیب شما</h2>
								</div>
							</div>
							<img loading='lazy' src={'/design/author.webp'} alt={AppConfig.name} className={'w-24 sm:w-28 rounded-full shadow-inner shrink-0'}/>
						</div>
					</SwiperSlide>
					<SwiperSlide>
						<div className={'h-[180px] bg-gradient py-2 rounded-3xl center text-white flex-col gap-2 px-4 overflow-hidden'}>
							<img loading='lazy' src={'/logo.webp'} alt={AppConfig.name} className={'w-28 sm:w-36 shrink-0'}/>
							<h3 className={'text-base sm:text-lg font-normal text-center'}>سلامتی از طریق دانش، آگاهی و عمل</h3>
						</div>
					</SwiperSlide>
					<SwiperSlide>
						<div className={'h-[180px] bg-gradient py-2 rounded-3xl center text-white flex-col gap-2 px-4 overflow-hidden'}>
							<img loading='lazy' src={'/logo.webp'} alt={AppConfig.name} className={'w-20 sm:w-[100px] shrink-0'}/>
							<div className={'center flex-col min-w-0'}>
								<p className="text-center">به {AppConfig.name}</p>
								<h3 className="text-center">خوش آمدید</h3>
							</div>
						</div>
					</SwiperSlide>
				</Swiper>
			</div>
		</Link>
	)
}

export default AppMainBanner;
