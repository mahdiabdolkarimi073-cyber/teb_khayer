'use client'
import {Document, Page, pdfjs} from 'react-pdf';
import React, {useEffect, useState} from "react";
import './pdf.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import {Button, Progress} from "@mantine/core";
import {IconZoomIn, IconZoomOut} from "@tabler/icons-react";
import Loading from "@/app/(app)/loading";
import {SocialsComponent} from "@/app/(web)/contact/socials";
import {readFile, saveFile} from "@/utils/indexedDB";


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({pdf: pdfUrl}: {pdf: string | File})=> {
	const [pdf, setPdf] = useState<string | File>(pdfUrl)
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [exists, setExists] = useState(false);
	const [error, setError] = useState(false);
	const [progress, setProgress] = useState(0)
	const [scale, setScale] = useState(0.8);
	const [info, setInfo] = useState({
		"type": "application/pdf",
		"size": 0,
		"date": 1711706031818,
		"exists": true
	});

	useEffect(()=>{

		if (typeof pdf === 'string') fetch(pdf, {
			method: "OPTIONS"
		}).then(r=>r.json())
			.then(async res => {
				if (!res.exists) {
					alert("فایل پی دی اف حذف شده است")
					setError(true);
					return;
				}
				const saved = await readFile(pdf as string);
				if (saved) {
					setPdf(new File([saved],'pdf.pdf'));
				}
				setInfo(res);
				setExists(true);
			}).catch(()=>{
				setError(true);
		})
	}, [])

	const onDocumentComplete = ({ numPages }: { numPages: number }) =>{
		setPages(numPages)
		if (numPages) {
			setLoading(false);
			console.log("LOAD")
		}
	}

	const onDocumentError = () => {
		setError(true);
	}

	const onSetScale = (type: number) =>{

		var newScale = type ? scale + 0.1 : scale - 0.1;

		if (newScale > 3){
			newScale = 3
		} else if (newScale < 0.1){
			newScale = 0.1
		}
		setScale(newScale)

	}

	const onPage = (type: number) =>{

		var newPage = type ? page + 1 : page - 1

		if (newPage > pages){
			newPage = 1
		} else if (newPage < 1){
			newPage = pages
		}

		setPage(newPage)
	}

	const zoomStyle = {
		marginLeft: 10,
		cursor: 'pointer'
	}

	const footer = (
		<div className="footer">
			<Button onClick={() => onPage(0)}>قبلی</Button>
			<div className={'center gap-1'}>
				<span style={{textAlign: 'center'}}>صفحه {page} از {pages}</span>
				<IconZoomOut style={{...zoomStyle, opacity: scale === 0.1 ? 0.5 : 1}} onClick={() => onSetScale(0)}/>
				<IconZoomIn style={{...zoomStyle, opacity: scale === 3 ? 0.5 : 1}} onClick={() => onSetScale(1)}/>
				<span>{Math.round(scale * 100)}%</span>
			</div>
			<Button onClick={() => onPage(1)}>بعدی</Button>
		</div>
	)

	if (error) return (
		<div className={'w-[90dvw] h-[90dvh] center flex-col gap-2'}>
			<h3>خطا در بارگذاری فایل</h3>
			<p>با پشتیبانی در ارتباط باشید</p>
			<SocialsComponent />
		</div>
	)
	if (!exists) return (
		<div className={'absolute min-h-screen left-0 top-0 center z-0 w-full h-full'} style={{zIndex: 0}}>
			<Loading msg={'درحال بررسی پی دی اف...'}/>
		</div>
	)

	const size = +((info.size / 1024 / 1024).toFixed(1));

	return (
		<div className={'relative'}>
			{loading && (
				<div className={'absolute min-h-screen left-0 top-0 center z-0 w-full flex-col h-full'} style={{zIndex: 0}}>
					<Loading msg={`درحال دانلود اطلاعات پی دی اف...`} additional={(
						<div style={{width: "200px"}}>
							<Progress className={'w-full'} value={progress} />
							<div className={'w-full center my-2'}>
								<p style={{direction: "ltr"}}>{((size / 100) * progress).toFixed(1)}/{size} MB</p>
							</div>
						</div>
					)}/>

				</div>
			)}
			<div className={`pdfWrapper ${loading && "opacity-0"}`}>
				<Document file={pdf} onLoadedData={console.log} onLoadSuccess={async (e)=>{
					onDocumentComplete(e);
					if (typeof pdf !== 'string') return;

					const buffer = Buffer.from(await e.saveDocument());
					await saveFile(pdf,buffer)
				}} onLoadProgress={(e) => {
					setProgress(e.loaded / e.total * 100)
				}}  onLoadError={onDocumentError} onError={onDocumentError}>
					<Page pageNumber={page} scale={scale} />
				</Document>
			</div>
			<div className={'fixed bottom-[4.5rem] left-0 bg-white w-full p-2 shadow z-10'}>
				{footer}
			</div>
		</div>
	)

};
export default PDFViewer;
