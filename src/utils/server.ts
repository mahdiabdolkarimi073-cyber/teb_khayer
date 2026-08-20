"use client";

import {useEffect, useState, useTransition} from "react";

export function useAction<T extends (...args: any[])=>Promise<any> = any>(func: T, ...args: any[]) {
	const [isPending, setIsPending] = useState(true)
	const [result, setResult] = useState<T>();
	const [previousArgs, setPreviousArgs] = useState<any[]>(args)

	const refetch = () => {
		setIsPending(true);
		const result = func(...args);
		result.then(setResult).finally(()=>{
			setIsPending(false);
			console.log("FALSE")
		})
	};
	useEffect(refetch, [])
	useEffect(() => {
		if (JSON.stringify(args) !== JSON.stringify(previousArgs)) {
			setPreviousArgs(args)
			refetch();
		}
	}, [...args]);
	useEffect(() => {
		console.log('isP', isPending)
	}, [isPending]);

	return {
		isPending,
		result,
		refetch
	} as {
		result: Awaited<ReturnType<T>>,
		isPending: boolean,
		refetch: any
	}
}
