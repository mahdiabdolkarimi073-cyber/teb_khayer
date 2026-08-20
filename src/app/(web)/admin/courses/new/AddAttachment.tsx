import {Attachment} from "@prisma/client";
import React, {useState} from "react";
import ApiLoadingState from "@/components/api/ApiLoadingState";
import {uploadFile} from "@/utils/api";

import {Button, FileInput, Select, TextInput} from "@mantine/core";
import {AttachmentTypeInfo} from "@/generated/AttachmentType.enum";
import {IconFile} from "@tabler/icons-react";

const AddAttachment = (props: { onEnd: (attachment: Attachment) => void, hideName?: boolean }) => {
	const [loading, setLoading] = useState(false);
	const [attachment, setAttachment] = useState<Partial<Attachment>>()


	return (
		<div className={'relative'}>
			<ApiLoadingState/>
			<form action={async (formData: FormData) => {
				const file = formData.get('file') as File;
				const path = `/attachment/${new Date().getTime()}-${attachment?.type ?? "unknown"}.$EX`;
				setLoading(true)
				const newPath = await uploadFile(file, path);
				setLoading(false);

				props.onEnd({
					...attachment,
					link: newPath
				} as Attachment)
			}} className={'flex flex-col gap-2 '}>
				{!props.hideName && (
					<TextInput
						label={'نام فایل'}
						required
						value={attachment?.name}
						onChange={e => setAttachment(pre => ({...pre, name: e?.target?.value}))}
					/>
				)}
				<Select
					required
					label={'نوع فایل'}
					value={attachment?.type}
					onChange={e => setAttachment(pre => ({...pre, type: e as any}))}
					data={Object.keys(AttachmentTypeInfo)}
				/>

				<FileInput
					name={'file'}
					required
					rightSection={<IconFile/>}
					label={'فایل'}
				/>
				<div className={'center p-2'}>
					<Button type={'submit'} loading={loading}>
						اپلود
					</Button>
				</div>
			</form>
		</div>
	)
}

export default AddAttachment;
