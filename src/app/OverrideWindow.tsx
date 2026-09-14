"use client";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {usePathname, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {inputModal} from "@/components/modal/ModalUtils";
import {isApplication} from "@/utils/serverComponents/app";
import {isCSApplication} from "@/utils/serverComponents/_app";
import Payment from "@backend/modules/payment/Payment";
import AppConfig from "@/config/AppConfig";

// Define your custom property
interface CustomWindow {
	isApplication: boolean;
	doPayment: (token: string | null | undefined) => void
}

declare global {
	interface Window extends CustomWindow {
	}
}


const OverrideWindow = (props: any) => {
	const params = useSearchParams();


	useEffect(() => {
		if (params.has("msg")) {
			alert(params.get("msg"));
		}
	}, [params])


	return null;
}

export let __PAGE_LOAD: any = () => {
}

export function usePageLoading() {
	const [loading, setLoading] = useState(false);
	const pathname = usePathname();
	const search = useSearchParams();

	function registerLinks() {
		const links = window?.document?.querySelectorAll('a:not(a[registered="true"],a[target="_blank"]), button[data-changer]:not(button[registered="true"])');

		links.forEach(link => {
			link.addEventListener('click', () => {
				const href = link?.getAttribute("href") + "";
				if (href === pathname) return;
				setLoading(true);
			});
			link.setAttribute("registered", "true");
		})
	}

	useEffect(() => {
		__PAGE_LOAD = setLoading;
		setLoading(false);

		let thread = setInterval(registerLinks, 500);
		return () => clearInterval(thread)
	}, [pathname, search])


	return loading;
}


const getColorStatusOfText = (message: string) => {
	let v = (str: string) => {
		message = message || "";
		str = str || "";
		let _msg = message;
		return _msg.startsWith(str) || _msg.endsWith(str) || _msg.includes(" " + str + " ");
	}


	switch (true) {
		case v('نشد'):
		case v('نشده'):
		case v("دسترسی"):
		case v("خطا"):
		case v("گرفته"):
		case v("نمیباشد"):
		case v("متاسف"):
		case v("رد"):
		case v('لغو'):
		case v('اشتباه'):
		case v('نیست'):
		case v('قبل'):
		case v('حد'):
			return "error";
		case v('لطفا'):
		case v('باید'):
		case v('هشدار'):
		case v('توجه'):
		case v('غیرمجاز'):
		case v('غیر مجاز'):
			return 'warn';
		case v('بررسی'):
		case v('درحال'):
			return "info";
		case v('شد'):
		case v('شده'):
		case v('موفق'):
		case v("داده"):
		case v("یافت"):
		case v("انجام"):
			return "success";
		default:
			return "info";
	}
}

if (typeof window !== 'undefined') {
	window.alert = (str) => {
		let func: any = toast;
		const detect = getColorStatusOfText(str);
		if (toast[detect]) {
			func = toast[detect];
		}
		func(str)
	}

	// @ts-ignore
	window.prompt = async (text) => {
		return await inputModal(text + "");
	}

	window.doPayment = (token) => {
		try {
			console.log('[DO_PAYMENT] START - token:', token?.substring(0, 20) + '...', 'length:', token?.length);

			if (!token) {
				console.error('[DO_PAYMENT] no token provided');
				alert("توکن یافت نشد")
				return;
			}
			if (isCSApplication()) {
				console.log('[DO_PAYMENT] CS application detected, redirecting to /doPayment');
				alert("به صفحه پرداخت هدایت میشوید...");
				const a = document.createElement("a");
				a.href = window.location.origin + `/doPayment?token=${token}`;
				a.target = '_blank';
				document.body.append(a);
				a.click();
				return;
			}

			const args = token.split(":");
			if (args?.[0] === 'FREE') {
				console.log('[DO_PAYMENT] FREE token, redirecting to:', args?.[1]);
				window.location.href = args?.[1];
				return;
			}

			const TID = AppConfig.TID;
			const isLocal = window.location.hostname.includes("localhost");
			const form = document.createElement("form");
			form.method = "POST";
			form.action = isLocal ? "http://localhost:3000/api/payment" : "https://sepehr.shaparak.ir:8080/MPay";
			const params = isLocal ? {
				"terminalid": TID,
				"invoiceid": token,
				"amount": 1000,
				"cardnumber": "603769******0286",
				"payload": "payload test",
				"hash": "C1ABAE5B4563277309F26F7EDF2406A28B1598B35CED3897219A30A3A1356320",
				"rrn": "125014252007",
				"tracenumber": 752766,
				"digitalreceipt": Math.random() + "",
				"datepaid": "1400-09-13 09:55:38",
				"respcode": 0,
				"respmsg": "تراکنش موفق انجام شده است - 0",
				"issuerbank": "بانک صادرات"
			} : {
				"TerminalID": TID,
				"token": token,
				"getMethod": "1"
			};

			console.log('[DO_PAYMENT] submitting form to:', form.action, 'TID:', TID, 'isLocal:', isLocal);

			for (const i in params) {
				if (params.hasOwnProperty(i)) {
					const input = document.createElement('input');
					input.type = 'hidden';
					input.name = i;
					input.value = params[i as keyof typeof params] + "";
					form.appendChild(input);
				}
			}

			document.body.appendChild(form);
			form.submit();
			form.parentNode?.removeChild(form);

		} catch(e: any) {
			console.error('[DO_PAYMENT] ERROR:', e);
			alert(`خطا: ${e?.message ?? e}`)
		}
	}
}

export default OverrideWindow;
