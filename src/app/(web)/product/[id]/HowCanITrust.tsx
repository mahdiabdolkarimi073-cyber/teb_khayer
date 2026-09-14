'use client';

import {Product, SettingKey} from "@prisma/client";
import {Button} from "@mantine/core";
import {_openCart} from "@/app/(web)/WebHeader";
import {closeLastModal} from "@/utils/modal";
import {useAction} from "@/utils/server";
import {getVar} from "@backend/utils/setting";
import Loading from "@/app/(app)/loading";
import {IconShieldCheck, IconBuildingBank, IconMapPin, IconWorld, IconPhone} from "@tabler/icons-react";

const HowCanITrust = (props: {
	product: Product
}) => {
	let {product} = props;

	const enamadAction = useAction(getVar, "TRUST_ENAMAD" as SettingKey);
	const bankAction = useAction(getVar, "TRUST_BANK_ACCOUNT" as SettingKey);
	const addressAction = useAction(getVar, "TRUST_ADDRESS" as SettingKey);
	const websiteAction = useAction(getVar, "TRUST_WEBSITE" as SettingKey);
	const phoneAction = useAction(getVar, "MAIN_PHONE" as SettingKey);

	if (enamadAction.isPending || bankAction.isPending || addressAction.isPending || websiteAction.isPending || phoneAction.isPending)
		return <Loading/>;

	const enamadText = enamadAction.result as string || "طب خیر دارای نماد الکترونیکی (اینماد) از وزارت صنعت، معدن و تجارت می‌باشد. این نماد نشان‌دهنده اصالت و اعتبار فروشگاه آنلاین ماست.";
	const bankText = bankAction.result as string || "بانک ملت - به نام بهزاد خیّر - شماره کارت: 6104-xxxx-xxxx-xxxx";
	const addressText = addressAction.result as string || "آدرس: تهران، خیابان ولیعصر، پلاک ۱۲۳";
	const websiteText = websiteAction.result as string || "https://teb-khayyer.ir";
	const phoneText = phoneAction.result as string || "045-33790667";

	return (
		<div>
			<div className={'center justify-start gap-2'}>
				<img className={'rounded'} src={product.images?.[0]} alt={product.name} style={{width: "70px", height: "70px"}} />
				<div className={'h-full center flex-col gap-2 justify-between'}>
					<p>{product.name}</p>
					<small className={'text-gray-700 w-full'}>{product.price.toLocaleString('fa')} تومان</small>
				</div>
			</div>
			<br/>
			<p className={'font-bold text-lg mb-2'}>چطوری اعتماد کنم؟</p>
			<div className={'flex flex-col gap-3'}>
				<TrustItem
					icon={<IconShieldCheck size={'1.5rem'} className={'text-green-600'}/>}
					title={'نماد اعتماد الکترونیکی'}
					text={enamadText}
				/>
				<TrustItem
					icon={<IconBuildingBank size={'1.5rem'} className={'text-blue-600'}/>}
					title={'حساب بانکی'}
					text={bankText}
				/>
				<TrustItem
					icon={<IconMapPin size={'1.5rem'} className={'text-red-500'}/>}
					title={'آدرس'}
					text={addressText}
				/>
				<TrustItem
					icon={<IconPhone size={'1.5rem'} className={'text-teal-600'}/>}
					title={'تلفن ثابت'}
					text={phoneText}
				/>
				<TrustItem
					icon={<IconWorld size={'1.5rem'} className={'text-indigo-500'}/>}
					title={'وب‌سایت'}
					text={websiteText}
				/>
			</div>
			<br/>
			<Button fullWidth onClick={()=>{
				closeLastModal();
				_openCart()
			}}>
				رفتن به سبد خرید
			</Button>
		</div>
	)
}

const TrustItem = (props: {
	icon: React.ReactNode,
	title: string,
	text: string
}) => {
	return (
		<div className={'flex gap-2 items-start p-3 rounded-lg bg-gray-50 border border-gray-200'}>
			<div className={'shrink-0 mt-1'}>
				{props.icon}
			</div>
			<div className={'flex flex-col gap-1'}>
				<p className={'font-bold text-sm'}>{props.title}</p>
				<p className={'text-sm text-gray-700 leading-relaxed'}>{props.text}</p>
			</div>
		</div>
	)
}

export default HowCanITrust;
