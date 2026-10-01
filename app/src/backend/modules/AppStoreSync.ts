import prisma from "@backend/modules/prisma/Prisma";
import {Course} from "@prisma/client";

export type BazaarProduct = {
	sku: string
	title_fa: string
	title_en: string
	description_fa: string
	description_en: string
	price: number
	state: string
	kind: string
	trial_period: number
	dealer: number
	contract: number
	supplier: number
	auto_refundable: boolean
};

export type MyketProduct = {
	creationDate: string
	skuId: string
	defaultStoreInfo: {
		storeId: number
		storeName: string
		price: number
		currency: string
		isDefault: boolean
	}
	skuTranslationInfo: Array<{
		title: string
		language: string
	}>
	subscriptionType: number
	translatedTitle: string
	type: string
	isActive: boolean
}

export type MyketProductsResponse = {
	appSkus: Array<MyketProduct>
	totalCount: number
}


export type BazaarProductsResponse = {
	type: string
	message: string
	products: Array<BazaarProduct>
}


export async function appStoresSync() {
	console.log("SYNC COURSE");
	const courses = await prisma.course.findMany({
		select: {
			id: true,
			name: true,
			price: true
		}
	});

	const bazaarCourses = (await bazaarFetch("").then(r=>r.json()).catch(console.error)) as BazaarProductsResponse;
	const myketCourses = (await myketFetch("").then(r=>r.json()).catch(console.error)) as MyketProductsResponse;
	const bazaarIds = (bazaarCourses.products || []).map(p => p.sku);
	const myketIds = (myketCourses.appSkus || []).map(p => p.skuId);

	console.log("MYKET",myketIds.length, "BAZAAR",bazaarIds.length)

	for (let course of courses.filter(o => !bazaarIds.includes(o.id) || !myketIds.includes(o.id))) {
		if (!bazaarIds.includes(course.id)) {
			const res = await bazaarFetch(`/${course.id}`).then(r=>r.json()).catch(console.error);
			const edit = res?.type !== 'not_found'
			console.log("SYNC", course.id,!edit ? "CREATION":"EDIT");
			console.log("SYNC", course.id,(await handleAppStoreCourse(course, edit, 'bazaar')).statusText)
		}
		if (!myketIds.includes(course.id)) {
			console.log((await handleAppStoreCourse(course, myketIds.includes(course.id), 'myket')).statusText)
		}
	}
}

export async function handleAppStoreCourse(course: Partial<Course>, edit = false, type: "bazaar" | "myket" | undefined = undefined) {
	if (!type) {
		await handleAppStoreCourse(course,edit, "bazaar");
		return await handleAppStoreCourse(course,edit, "myket");
	}
	console.log("SYNC",type,course.id)
	if (type === "bazaar") {
		return await bazaarFetch(`/${edit ? course.id:""}`, edit ? "PUT":'POST', {
			"sku": course.id,
			"title_fa":course.name,
			"title_en": course.name,
			"description_fa": "",
			"description_en": "",
			"price": (course.price || 0) * 10,
			"state": "A",
			"kind": "P"
		});
	}

	return await myketFetch('', edit ? "PUT":"POST", {
		"creationDate": new Date().toUTCString(),
		"skuId": course.id,
		"skuTranslationInfo": [
			{
				"title": course.name,
				"language": "Fa"
			},
			{
				"title": "",
				"language": "En"
			}
		],
		"subscriptionType": 0,
		"translatedTitle": course.name,
		"type": "Product",
		"isActive": true,
		"skuStores": [
			{
				"storeId": 1,
				"storeName": "فروشگاه مایکت",
				"price": (course.price || 0) * 10,
				"currency": "ریال",
				"isDefault": true
			}
		]
	})
}

async function bazaarFetch(path: string,method = "GET", body: any = undefined) {
	return fetch(`https://pishkhan.cafebazaar.ir/api/apps/com.fazelunity.tebkhayyer/products${path}?lang=fa`, {
		"headers": {
			"accept": "application/json, text/plain, */*",
			"accept-language": "en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7",
			"authorization": "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImFuY2llbnQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJuYXNoZXItcGlzaGtoYW4tYWNjZXNzIiwiaWF0IjoxNzIwMjY5Mzc1LCJleHAiOjE3MjAzNTU3NzUsImp0aSI6IjEyMmFkYWNiLTJiMmItNDU5ZC1hODMxLTg5NDYxZGNiMjUwMiIsInVzZXJfaW5mb19lbWFpbCI6InRlYmtoYXl5ZXI0MTIwQGdtYWlsLmNvbSIsInB1Ymxpc2hlcl9pc19rZXlfYWNjb3VudCI6ZmFsc2V9.1vZbeU1nZXjRNJphmzdYWPP7IjfNfTq4GtV0HTjqNhk",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-requested-with": "XMLHttpRequest",
			"cookie": "sib_cuid=26b2073e-cc43-47a5-bcf7-f534fb554fe9; _hjSessionUser_764891=eyJpZCI6ImRmMGNmYjMzLTkwMzctNWY4NC05NWQ5LWU0NmM0ZGFjNDNmMSIsImNyZWF0ZWQiOjE3MDc3MjYzMzI2OTgsImV4aXN0aW5nIjp0cnVlfQ==; G_ENABLED_IDPS=google; G_AUTHUSER_H=0; _ga_MX9FMGBSH9=GS1.1.1714625840.9.0.1714625840.60.0.0; _gid=GA1.2.1320347387.1720086752; _hjSession_764891=eyJpZCI6IjRkMzFjMDU5LTBmY2YtNGNkYS1iNzdjLTk0NTE0NzA5N2JmMCIsImMiOjE3MjAwOTE5OTAxODksInMiOjEsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; _ga=GA1.2.1059657063.1707726335; _ga_TSBF7YGSGY=GS1.1.1720091486.8.1.1720092222.0.0.0; _ga_ECYW7SE88E=GS1.2.1720092083.37.1.1720092280.60.0.0",
			"Referer": "https://pishkhan.cafebazaar.ir/apps/com.fazelunity.tebkhayyer/in-app-purchases/products",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			...body && ({
				'content-type': "application/json"
			})
		},
		"body": !!body ? JSON.stringify(body):null,
		"method": method
	});
}

async function myketFetch(path: string, method = "GET", body: any = undefined) {
	return fetch(`https://developer.myket.ir/api/developers/146404967.MyketAccountId/applications/com.fazelunity.tebkhayyer/skus?lang=fa${method === "GET" ? "&limit=9999":""}`, {
		"headers": {
			"accept": "application/json, text/plain, */*",
			"accept-language": "en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7",
			"authorization": "eyJhY2MiOiIxNDY0MDQ5NjcuTXlrZXRBY2NvdW50SWQiLCJkdCI6MjY4Njc2MTU5LCJoc2giOiJkRVVQZzBwR2htdVhyMWVWMXhxRzE2dlNJeEE9IiwidCI6IkJyb3dzZXIiLCJpIjoiMTUxLjIzNS4xMDAuMTUifQ",
			...body && ({
				'content-type': "application/json"
			}),
			"myket-version": "503",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-requested-with": "XMLHttpRequest",
			"cookie": "_clck=1jzh3is%7C2%7Cfn8%7C0%7C1648; _gid=GA1.2.1035729079.1720269788; _ga_X1Z55PW089=GS1.2.1720269788.1.0.1720269788.0.0.0; myketAccessToken=eyJhY2MiOiIxNDY0MDQ5NjcuTXlrZXRBY2NvdW50SWQiLCJkdCI6MjY4Njc2MTU5LCJoc2giOiJkRVVQZzBwR2htdVhyMWVWMXhxRzE2dlNJeEE9IiwidCI6IkJyb3dzZXIiLCJpIjoiMTUxLjIzNS4xMDAuMTUifQ; secureId=6C181A2D8C2AF68DACDD112240A64D36D2E9E8F5F322BAA68C7AC3C713305A38; accountId=146404967.MyketAccountId; _ga=GA1.1.890727593.1720269787; _ga_J6WM7QK92Q=GS1.1.1720269786.1.1.1720270132.0.0.0",
			"Referer": "https://developer.myket.ir/fa/application/com.fazelunity.tebkhayyer/sku/new",
			"Referrer-Policy": "strict-origin-when-cross-origin"
		},
		"body": !!body ? JSON.stringify(body):null,
		"method": method
	});
}
