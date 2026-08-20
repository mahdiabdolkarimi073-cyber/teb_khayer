'use client';

import React, {useState} from "react";
import {Button, NumberInput, TextInput} from "@mantine/core";
import {Order} from "@prisma/client";
import {trackOrder} from "@/app/(web)/track/action";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import Link from "next/link";

const TrackProduct = (props: any) => {
	const [fields, setFields] = useState<Partial<{
		orderId: number,
		phone: number
	}>>({});
	const [order, setOrder] = useState<Awaited<ReturnType<typeof trackOrder>>>();

	const f = (x: keyof typeof fields) => {

		return {
			onChange: (e: any) => setFields(pre => ({
				...pre,
				[x]: e?.target?.value || e
			})),
			value: fields[x]
		}
	}

	return (
		<div className={'center flex-col gap-5'}>
			{!!order && (
				<div className={'center flex-col gap-2'}>
					<p className={'text-green-400'}>سفارش یافت شد</p>
					<small>{new Date(order.created_at).toLocaleString('fa')}</small>
					<h3>{OrderStatusEnum[order.status]}</h3>
					<h4>{order.payment.amount.toLocaleString('fa')} تومان</h4>
					<div className={'center gap-2 flex-col'}>
						{order.products.map(p => (
							<Link href={`/product/${p?.product?.id}`}>
								<div className={'center justify-between'}>
									<p>{p.product.name}</p>
									<p>{p?.count} عدد</p>
								</div>
							</Link>
						))}
					</div>

					<br/>
					<br/>
				</div>
			)}
			<div className={'center flex-wrap gap-2'}>
				<NumberInput
					label={'شناسه سفارش (ID)'}
					{...f('orderId')}
				/>
				<NumberInput
					label={'شماره تلفن'}
					{...f('phone')}
				/>
			</div>
			<Button onClick={()=>{
				console.log(fields)
				trackOrder(fields.orderId!, fields.phone!).then(order => {
					if (!alert) alert("متاسفانه سفارش شما یافت نشد");

					setOrder(order);
				}).catch(()=>{
					alert("متاسفانه سفارش شما یافت نشد")
				});
			}}>
				پیگیری
			</Button>
		</div>
	)
}

export default TrackProduct;
