'use client';

import React from "react";
import Link from "next/link";
import {modal} from "@/utils/modal";
import AppDownloadBtn from "@/app/(web)/AppDownloadBtn";

const Taghvims = (props: any) => {


	return (
		<div className={`center justify-between gap-2 ${props.application  && " grid grid-cols-2"}`}>
			{['تقویم حجامت مناسب|در سال جاری', 'تقویم قمر در عقرب|در سال جاری'].map(s => {
				let [name, year] = s.split("|");
				let color = name.includes("حجامت") ? "from-green-500":"from-red-500"

				return (
					<Link onClick={(e)=>{
						if (!props.application) {
							e.stopPropagation();
							e.preventDefault();
							modal(name, (
								<div className={'center flex-col gap-4'}>
									<p>
										برای دانلود رایگان تقویم قمر در عقرب و تقویم حجامت مناسب در سال جاری
										ابتدا اپلیکیشن
										طب خیر را به صورت رایگان دانلود کنید
									</p>
									<AppDownloadBtn />
								</div>
							));

							return false;
						}
					}} href={props.application ? `/app/taghvim/${name.includes("حجامت") ? "HEJAMAT":"AGHRAB"}`:"/about"}>
						<div className={`${color} p-2 border rounded-xl bg-gradient-to-tl to-secondary center flex-col text-white shadow-inner ${props.application && "flex-grow"}`}>
							<p className={'text-white text-sm'}>{name}</p>
							<b>{year}</b>
						</div>
					</Link>
				)
			})}
		</div>
	)
}

export default Taghvims;
