'use client';

import {Attachment} from "@prisma/client";
import React, {useState} from "react";
import ZoomableImage from "@/app/(app)/app/dashboard/courses/[id]/ZoomableImage";
import PDFViewer from "@/app/(app)/app/dashboard/courses/[id]/PDFViewer";

const ViewAttachment = (props: {
	attachment: Attachment
}) => {
	let {attachment} = props;
	const [loading, setLoading] = useState(true)
	const [key, setKey] = useState(Math.random())

	const url = `${window.location.origin}${attachment.link}`;

	return (
		<div>
			{attachment.type === "PDF" && (
				<div key={loading + ""} className={'relative'}>
					<PDFViewer pdf={attachment.link} />
				</div>
			)}
			{attachment.type === "VIDEO" && (
				<div>
					{/*@ts-ignore*/}
					<video key={'video'} autoPlay controls controlsList={'nodownload'}
						  className={'w-full rounded-xl h-full'}>
						<source src={"https://teb-khayyer.ir" + attachment.link} type="video/mp4"/>
						<source src={"https://teb-khayyer.ir" + attachment.link} type="video/mkv"/>
						<source src={"https://teb-khayyer.ir" + attachment.link} type="video/ogg"/>
						<source src={"https://teb-khayyer.ir" + attachment.link} type="video/mpeg"/>
					</video>
				</div>
			)}
			{attachment.type === "IMG" && (
				<div>
					<ZoomableImage imagePath={attachment.link}/>
				</div>
			)}
		</div>
	)
}

export default ViewAttachment;
