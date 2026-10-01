import React from "react";
import {IconSparkles} from "@tabler/icons-react";

const Page = (props: any) => {

	return (
		<div className={'bg-white p-5 min-h-screen flex flex-col gap-3'}>
			<div className={'center gap-1 justify-start'}>
				<IconSparkles size={'1.5rem'} className={'text-primary'}/>

				<h2 className={'text-base'}>
					بهزاد خیّر هستم طبیب و مدرّس شما
					<span className={'text-xl'}>🌹</span>
				</h2>

			</div>
			<Content>
				درود ناظم هستی بر شما که طِب خیّـر را در مسیر سلامتی خود و خانواده ایرانی قرار داده اید.
			</Content>

			<div className={'center gap-2 justify-start'}>
				<IconSparkles size={'2rem'} className={'text-primary'}/>
				<h2 className={'text-base'}>مدّتی است...</h2>
			</div>
			<Content>
				با تعدادی از دوستان دلسوز و متعالی قدمی برداشته ایم تا دو رُکن اساسی آموزش و درمان را به منظور بَسط
				و گسترش درمان ریشه ای بیماری ها، در خدمت مردم ایران زمین باشیم.
			</Content>
			<div className={'center gap-2 justify-start'}>
				<IconSparkles size={'2rem'} className={'text-primary'}/>
				<h2 className={'text-base'}>و امّا...</h2>
			</div>
			<Content>
				رسالت ما براین مبنا است که با رهاسازی انرژی منفی تک تک سلولهای مسدود شده در ذهن با روش بی ابزاری و
				از طرفی با استفاده از ابزار طب ایرانی که سنت دیرین بسیاری از کشورها نیز است، ساختار پاکسازی و درمان
				بنیادی کالبد ذهنی و جسمی را به انسجام اولیه سوق داده و سرلوحه شعار نفسهایمان را نیایش اَمّن یُجیبُ
				قرار دهیم
			</Content>
		</div>
	)
}

const Content = (props: any) => {

	return (
		<div className={'p-2 rounded-2xl bg-gray-200 text-sm'}>
			{props?.children}
		</div>
	)
}


export const metadata = {
	title: "سلام"
}

export default Page;
