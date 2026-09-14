import React from "react";
import AboutContent from "@/app/(web)/AboutContent";
import HomeSlider from "@/app/(web)/HomeSlider";
import HomeProduct from "@/app/(web)/HomeProduct";
import HomeCategoryList from "@/app/(web)/HomeCategoryList";
import HomeHero from "@/app/(web)/HomeHero";
import HomeCourseCategoryList from "@/app/(web)/HomeCourseCategoryList";
import AppDownloadSection from "@/app/(web)/AppDownloadSection";


export default function Home() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-start  my-5 relative">
			<p className="blinking-text absolute -top-3 left-0 right-0 mx-auto w-full text-center p-2">فیلتر شکن خود را خاموش کنید</p>
			<HomeSlider/>
			<AppDownloadSection />
{/*			<br/>
			<HomeProduct/>
			<br/>
			<br/>
			<HomeCategoryList/>
			<br/>
			<br/>
			<br/>
			<HomeCourseCategoryList />
			<br/>
			<br/>
			<br/>
			<HomeHero/>
			<br/>
			<br/>
			<br/>*/}
		</div>
	);
}
