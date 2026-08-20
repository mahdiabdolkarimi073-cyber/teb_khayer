import {cookies, headers} from "next/headers";

export function isApplication() {
	const searchParams: any = new URL(headers().get('referer') ?? "http://localhost").searchParams;
	const userAgent = headers().get('user-agent')+"";
	const cookie = cookies().get('app');
	if (typeof cookie?.value !== 'undefined') return true;
	return searchParams?.has("app") || typeof searchParams?.app !== 'undefined' || userAgent.includes("unity-app");
}
