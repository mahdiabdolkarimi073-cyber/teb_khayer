import {User} from "@prisma/client";

export const CheckoutFields = {
	name: "نام و نام خانوادگی گیرنده",
	phone: "شماره تلفن گیرنده",
	state: "استان محل تحویل",
	city: "شهر محل تحویل",
	address: "آدرس محل تحویل",
	zipcode: "کد پستی (اختیاری)"
} as ({[key in keyof User]: string}) | ({[key: string | symbol]: string})
