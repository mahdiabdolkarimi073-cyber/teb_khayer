import AppConfig from "@/config/AppConfig";
import Link from "next/link";
import {Button} from "@mantine/core";
import React from "react";

const AboutContent = (props: any) => {

	return (
		<div className='relative center w-full min-h-[80vh] overflow-hidden rounded '>
			<img loading='lazy' src={'/design/home-slider.png'}
				className={'absolute w-full h-full left-0 top-0 object-cover shadow-inner blur-md'}/>
			<div className={'absolute left-0 top-0 bg-black/50 w-full h-full'}></div>
			<div className={'relative container mx-auto h-full'}>
				<div className={'h-full w-full center p-4 py-5 lg:py-0 flex-wrap md:flex-nowrap'}>
					<img loading='lazy' src={'/design/home-slider.png'}
						className={' w-[350px] rounded-xl'}/>
					<div className={'text-white center items-start flex-col gap-2 md:p-3'}>
						<div className={'center'}>
							<img loading='lazy' src={'/logo.webp'} className={'w-[70px]'} loading={'lazy'}
								alt={AppConfig.name}/>
							<h3>{AppConfig.name}</h3>
						</div>
						<p className={'text-sm text-justify'}>دوره حجامت خشک و حجامت تر_دوره فصد_دوره کامل مزاج
							شناسی_دوره ماساژ درمانی_دوره آشنایی با اسکلت بدن_دوره آشنایی باعضلات بدن_آموزش
							هزارسوال وپاسخ آزمون مربی گری ماساژ_دوره زبان شناسی_دوره کف شناسی_دوره گوش شناسی_دوره
							ناخ شناسی_دوره ناف شناسی_دوره چهره شناسی_دوره طب سوزنی_دوره زالودرمانی_دوره
							کایروپراکتیک_دوره شناخت گیاهان دارویی_دوره آزمایش خوانی_دوره لاغری و... را در اختیار
							کاربران محترم قرار داده است تا باپرداخت کمترین هزینه ممکنه از طریق اپلیکیشین طب خیّر
							بتوانند به توان عِلمی و عَملی خود بیافزایند.
						</p>
						<Link href={'/about'}>
							<Button>
								درباره ما
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AboutContent;
