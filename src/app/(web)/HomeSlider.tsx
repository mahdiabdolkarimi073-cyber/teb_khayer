import {Icon, IconLemon, IconSchool} from "@tabler/icons-react";
import prisma from "@backend/modules/prisma/Prisma";
import React, {ReactNode} from "react";
import Link from "next/link";
import AppDownloadBtn from "@/app/(web)/AppDownloadBtn";
import InfoItem from "@/app/(web)/InfoItem";
import AppConfig from "@/config/AppConfig";
import Taghvims from "@/app/(web)/Taghvims";


const HomeSlider = async (props: any) => {
	return (
		<div className={'container mx-auto py-5 md:py-20'}>
			<div className={'center justify-stretch lg:flex-nowrap content-stretch flex-wrap gap-4 p-3 md:p-0 px-4 md:px-0'}>
				<div className={'center flex-col justify-between items-stretch h-full'}>
					<div>
						<p className={'font-bold text-xl'}> به مجموعه آموزشی طب خیر خوش آمدید</p>
						<p className={'text-justify max-w-[700px]'}>

							همانطوریکه مستحضرید، طب سنتی و روایی که موردتایید حکیم
							خیراندیش و دکتر روازاده و آیت ا... تبریزیان نیزهست نعمتی
							ارزشمندبرای درمان بیماری های سخت میباشد ومجموعه بزرگ طب
							خیر با همراهی کادر مجرب متشکل از پزشک عمومی ، طبیب و استاد
							حاذق طب سنتی و طب ایرانی اسلامی وکارشناسان حوزه طب سنتی ،
							نمایندگان مجاز و مربیان دارای مجوز، تدابیری خاص فراهم نموده است
							که با اخذ تاییدیه های مجاز ، مردم ایران زمین و کشورهای دوست و
							همسایه بتوانند ضمن دریافت دوره های آموزشی تخصصی و فرادرسی
							مشتمل بر آموزش مجازی طب سنتی ،حجامت ، مزاجشناسی ، ماساژ
							درمانی ، سوالات آزمون کاربر ماساژ و مربی ماساژ و...در قالب فیلم و
							فایل پی دی اف ( pdf ) ، از خواص بیشمار گیاهان دارویی نیز برای
							سلامتی جسم وروان خویش بهره مند شوند.
						</p>
					</div>
					<div className={'hidden sm:block mt-1'}>
						<Taghvims/>
					</div>
				</div>
				<div className={'flex-grow center flex-col items-stretch gap-2'}>
					<AppDownloadBtn fullWidth className={'animate-bounce'}/>
					<div className={'center justify-stretch items-stretch  flex-wrap flex-col gap-2'}>
						<div className={'center flex-col sm:flex-row items-stretch justify-stretch gap-2'}>
							<InfoItem title={'دوره ها'} description={`دوره های آموزشی ${AppConfig.name}`}
									link={'/about'}
									icon={<IconSchool size={'2.3rem'}/>}/>
							<InfoItem title={'محصولات گیاهی و سوغات محلی'}
									description={'فروش انواع محصولات گیاهی و سوغات سنتی'}
									link={'/showIntro'} icon={<IconLemon size={'2.3rem'}/>}/>
						</div>
						<InfoItem title={'تشخیص بیماری ها از روی زبان'}
								description={'با ارسال تصویر زبان خود می توانید برای بیماری احتمالی خود مشاوره بگیرید'}
								link={(
									<p>
										برای دریافت مشاوره در خصوص تشخیص برخی از بیماری های بدن خوداز روی زبان ابتدا اپلیکیشن
										طب خیر را به صورت رایگان دانلود کنید
									</p>
								)}
								icon={<img loading='lazy' src={'/design/zaban.webp'} alt={'زبان'}
										 className={'w-[50px] rounded-full object-cover'}/>}/>
						<InfoItem
							title={'تفسیر برگه آزمایش – تفسیر سونوگرافی'}
							description={'با ارسال تصویر برگه آزمایش و سونوگرافی خود می توانید اطلاعات لازم رو در خصوص بیماری خود وعزیزانتون کسب کنید'}
							link={<Tafsir />}
							icon={
								<img loading='lazy'
									src={'/design/scope.png'}
									className={'w-[50px] rounded-full object-cover'}/>
							}
						/>
					</div>
					<div className={'block sm:hidden'}>
						<Taghvims/>
					</div>
				</div>
			</div>
		</div>
	)
}

const Tafsir = ()=>{


	return (
		<div>
			<p>
				برای دریافت اطلاعات تفسیر آزمایش و سونوگرافی خود و عزیزانتان ابتدا اپلیکیشن
				طب خیر را دانلود کنید
			</p>
		</div>
	)
}

export default HomeSlider;
