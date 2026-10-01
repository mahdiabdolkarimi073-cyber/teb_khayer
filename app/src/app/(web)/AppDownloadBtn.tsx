import {Button, ButtonProps} from "@mantine/core";
import AppConfig from "@/config/AppConfig";
import React from "react";
import {IconDownload} from "@tabler/icons-react";
import Link from "next/link";

const AppDownloadBtn = (props: ButtonProps) => {

	return (
		<a href={'https://teb-khayyer.ir/api/file/app.apk'}>
			<Button  {...props} size={props.size || "lg"} gradient={{
				from: "#5274b4",
				to: "#2489e2",
				deg: 90
			}} leftSection={<IconDownload size={'2rem'} />} variant={'gradient'} radius={props.radius || '8px'} className={'text-wrap  '+props.className}>
				دانلود رایگان اپلیکیشین {AppConfig.name}
			</Button>
		</a>
	)
}

export default AppDownloadBtn;
