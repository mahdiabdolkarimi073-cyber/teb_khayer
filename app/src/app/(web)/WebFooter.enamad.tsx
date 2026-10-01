"use client"

import {useState} from "react";

const WebFooterEnamad = () => {
	const [test, setTest] = useState(true);
	const [error, setError] = useState(false);

	const realSrc = 'https://trustseal.enamad.ir/logo.aspx?id=492568&Code=yv1uhHbwx5BN5pAtNTXMUVMR31wl119D';
	const testSrc = "/design/enamad.png";

	return (
		<a referrerPolicy='origin' target='_blank'
		   className={'relative'}
		   href='https://trustseal.enamad.ir/?id=492568&Code=yv1uhHbwx5BN5pAtNTXMUVMR31wl119D'>
			<img loading='lazy'
				alt={"نماد اعتماد"}
				src={realSrc}
				onError={()=>setError(true)}
				// @ts-ignore
				onLoad={(e)=>setTest((e.target?.width ?? 0) < 10)}
				className={'opacity-0 absolute w-full h-full rounded-2xl'}
				referrerPolicy='origin'
				// @ts-ignore
				Code='rnMjhvCZgp5TJVRpLMBIUHE67sog4cYM'
			/>
			<img loading='lazy'
				// @ts-ignore
				test_mode={test+""}
				error={error+""}
				className={'w-full h-full rounded-2xl'}
				referrerPolicy='origin'
				src={test || error ? testSrc:realSrc}
				alt={"نماد اعتماد"}
				style={{cursor: "pointer"}}
				// @ts-ignore
				Code='rnMjhvCZgp5TJVRpLMBIUHE67sog4cYM'
			/>
		</a>
	)
}

export default WebFooterEnamad;
