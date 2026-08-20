'use client';

import React, {useState} from "react";
import {Button} from "@mantine/core";
import {closeLastModal, modal} from "@/utils/modal";
import {TaghvimType} from "@prisma/client";
import TaghvimTypeEnum from "@/generated/TaghvimType.enum";
import AddAttachment from "@/app/(web)/admin/courses/new/AddAttachment";
import prisma from "@backend/modules/prisma/Prisma";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {useRouter} from "next/navigation";

const UploadTaghvimFile = (props: {
	taghvim: TaghvimType,
	refetch?: ()=>any
}) => {
	const [loading, setLoading] = useState(false)
	const name = TaghvimTypeEnum[props.taghvim];
	const router = useRouter();

	return (
		<Button loading={loading} onClick={()=>{
			modal(`بارگذاری تقویم ${name}` , (
				<AddAttachment hideName onEnd={(attachment) => {
					closeLastModal();
					setLoading(true);
					handlePrismaQuery("taghvim", 'upsert', {
						where: {
							id: props.taghvim
						},
						create: {
							id: props.taghvim,
							type: attachment.type,
							link: attachment.link
						},
						update: {
							type: attachment.type,
							link: attachment.link
						}
					})
						.then(()=>{
							router.refresh();
							props?.refetch?.();
						})
						.finally(()=>setLoading(false))
				}} />
			))
		}}>
			بارگذاری فایل
		</Button>
	)
}

export default UploadTaghvimFile;
