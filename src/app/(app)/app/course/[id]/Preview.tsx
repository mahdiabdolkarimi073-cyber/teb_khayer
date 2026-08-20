"use client";

import React, {useEffect, useRef, useState} from "react";
import {AspectRatio} from "@mantine/core";
import {IconPlayerPlay} from "@tabler/icons-react";

const Preview = (props: {
	preview: string | null
}) => {
	const [play, setPlay] = useState(false)
	const ref = useRef<HTMLVideoElement>();
	const [showVideo, setShowVideo] = useState(!!props?.preview);

	useEffect(() => {
		if (play) ref?.current?.play();
	}, [play]);

	if (!showVideo) return null;

	const preview = props.preview+"#t=0.1"

	return (
		<div className={'mt-3'}>
			<div className={'relative center h-[300px]'}>
				{!play && (
					<div onClick={() => {
						setPlay(true)
					}} className={'absolute left-0 top-0 text-white center h-full w-full z-10'}>
						<IconPlayerPlay size={'4rem'} />
					</div>
				)}
				<video key={'video'} ref={ref as any} preload={'none'} controls
					  className={'w-full rounded-xl h-full'} onError={()=>setShowVideo(false)}>
					<source src={preview} type="video/mp4" />
					<source src={preview} type="video/mkv" />
					<source src={preview} type="video/ogg" />
					<source src={preview} type="video/mpeg" />
				</video>
			</div>
		</div>
)
}

export default Preview;
