"use client";

import {useEffect, useState, useTransition} from "react";

export function useAction<T extends (...args: any[])=>Promise<any> = any>(func: T, ...args: any[]) {
	const [isPending, setIsPending] = useState(true)
	const [result, setResult] = useState<T>();
	const [error, setError] = useState<Error | null>(null);
	const [previousArgs, setPreviousArgs] = useState<any[]>(args)

	const refetch = () => {
		setIsPending(true);
		setError(null);
		Promise.resolve()
			.then(() => func(...args))
			.then((res) => {
				setResult(res);
				return res;
			})
			.catch((err) => {
				console.error('[useAction] server action failed:', err);
				setError(err instanceof Error ? err : new Error(String(err)));
			})
			.finally(() => {
				setIsPending(false);
			})
	};
	useEffect(refetch, [])
	useEffect(() => {
		if (JSON.stringify(args) !== JSON.stringify(previousArgs)) {
			setPreviousArgs(args)
			refetch();
		}
	}, [...args]);

	return {
		isPending,
		result,
		error,
		refetch
	} as {
		result: Awaited<ReturnType<T>>,
		isPending: boolean,
		error: Error | null,
		refetch: any
	}
}
