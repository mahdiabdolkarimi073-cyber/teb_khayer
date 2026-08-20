"use client";

import {Service} from "@prisma/client";
import React, {useState} from "react";
import {Button, NumberInput} from "@mantine/core";
import BlogContentEditor from "@/app/(web)/admin/courses/new/BlogContentEditor";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {useRouter} from "next/navigation";

const ServiceManagement = (props: {
	service: Service
}) => {
	const [service, setService] = useState(props.service);
	const [loading, setLoading] = useState(false);

	return (
		<form action={async (formData) => {
			let json: any = {};
			formData.forEach((value, key) => {
				json[key] = value;
			});
			setLoading(true);
			handlePrismaQuery("service", "update", {
				where: {
					id: service?.id
				},
				data: {
					...json,
					amount: +json.amount
				}
			}).then(()=>{
				window.location.href = '/admin/services'
				alert("باموفقیت ذخیره شد")
			}).finally(()=>{
				setLoading(false);
			})
		}}>
			<NumberInput
				label={' قیمت سرویس (تومان)'}
				defaultValue={service.amount}
				name={'amount'}
				description={'قیمت 0 به معنی رایگان بودن سرویس است'}
			/>
			<input hidden value={service.beforeContent} name='beforeContent'/>
			<input hidden value={service.afterContent} name='afterContent'/>
			<div className={'center my-2'}>
				<Button disabled={loading} type={'submit'}>
					ذخیره
				</Button>
			</div>
			<hr className={'my-2'} />
			<p>محتوای قبل از پرداخت</p>
			<BlogContentEditor content={service.beforeContent} onChange={(html) => setService(pre => ({
				...pre,
				beforeContent: html
			}))}/>
			<br/>
			<p>محتوای بعد از پرداخت</p>
			<BlogContentEditor content={service.afterContent} onChange={(html) => setService(pre => ({
				...pre,
				afterContent: html
			}))}/>
			<br/>

		</form>
	)
}

export default ServiceManagement;
