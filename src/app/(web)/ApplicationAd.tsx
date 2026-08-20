import AppDownloadBtn from "@/app/(web)/AppDownloadBtn";
import {IconBook, IconCheck, IconLighter, IconSchool} from "@tabler/icons-react";

const ApplicationAd = (props: any) => {

	return (
		<div className={'center flex-col container mx-auto p-2 gap-2'}>
              <h3 className={'text-center'}>اپلیکیشین طب خیر</h3>
			<p className={'text-center  max-w-[600px]'}>  با دریافت و نصب رایگان طب خیر،<br/>
				می توانید با استفاده از گوشی همراه به راحتی و در هر مکان و هر لحظه، از
				تمامی امکانات مجموعه آموزشی و فروشگاه گیاهان دارویی بهره مند شوید
			</p>
			<AppDownloadBtn size={'sm'} />
			<div className={'center justify-evenly gap-10 mt-3 flex-wrap'}>
				{[
					{
						label: "صدها هزار دانشجو",
						icon: IconSchool
					},
					{
						label: "هزاران ساعت آموزش",
						icon: IconBook
					},
					{
						label: "دسترسی آنی و همیشگی",
						icon: IconLighter
					},
					{
						label: "تضمین کیفیت",
						icon: IconCheck
					}
				].map(item => (
					<div className={'center flex-wrap flex-col'}>
						<item.icon size={'2rem'} className={'text-primary'} />
						<p>{item.label}</p>
					</div>
				))}
			</div>
		</div>
	)
}

export default ApplicationAd;
