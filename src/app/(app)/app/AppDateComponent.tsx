"use client";

import {IconCalendar, IconCalendarCheck, IconCalendarTime} from "@tabler/icons-react";
import {useEffect, useState} from "react";

export const dynamic = 'force-dynamic'
const AppDateComponent = (props: any) => {
	const handle = ()=>({
		day: getPersianDateNumber('day'),
		date: new Date(),
		wm: `${getPersianDateString('month')} - ${getPersianDateString('weekday')}`,
		year: getPersianDateNumber('year')
	})
	const [data, setData] = useState(handle())

	useEffect(() => {
		setData(handle());
	}, []);

	return (
		<div className={'p-3 sm:p-4 bg-secondary rounded-3xl shadow center justify-between text-white gap-2'}>
			<IconCalendarTime  className="shrink-0" size={'2.5rem'} />
			<h2 className={'text-3xl sm:text-5xl shrink-0'}>{data.day}</h2>
			<div className="text-center min-w-0">
				<p className="truncate">{data.wm}</p>
				<p className="truncate">{data.date.toLocaleDateString()}</p>
			</div>
			<h2 className="shrink-0">{data.year}</h2>
		</div>
	)
}

export function getPersianDateString(key:  keyof Intl.DateTimeFormatOptions, locale = 'fa-IR', calendar = 'persian') {
	const currentDate = new Date();

	const options = {
		[key]: 'long', // full name of the month
		calendar // Persian calendar
	};

	return currentDate.toLocaleDateString(locale, options);
}

export function getPersianDateNumber(key:  keyof Intl.DateTimeFormatOptions, locale = 'fa-IR', calendar = 'persian') {
	const currentDate = new Date();

	const options = {
		[key]: 'numeric', // full name of the month
		calendar // Persian calendar
	};

	return currentDate.toLocaleDateString(locale, options);
}

export default AppDateComponent;
