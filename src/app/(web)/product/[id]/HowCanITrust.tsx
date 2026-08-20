'use client';

import {Product} from "@prisma/client";
import {Button} from "@mantine/core";
import {_openCart} from "@/app/(web)/WebHeader";
import {closeLastModal} from "@/utils/modal";

const HowCanITrust = (props: {
	product: Product
}) => {
	let {product} = props;

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
			<p className={'font-bold'}>چطوری اعتماد کنم؟</p>
			<img src={'/design/trust.png'} alt={'اعتماد'} style={{width: "90%"}} className={'object-contain pointer-events-none'} />
			<img src={'/design/trust_continue.jpg'} alt={'اعتماد'} style={{width: "90%"}} className={'object-contain mx-auto pointer-events-none'} />
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

export default HowCanITrust;
