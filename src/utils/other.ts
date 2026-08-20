export function getRandomNumber(min: number, max: number) {
	if (min >= max) {
		return min;
	}

	// Calculate and return the random number
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function arabicToEnglishNumber(str: any): string {
	const
		persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],
		arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g]

	for (let i = 0; i < 10; i++) {
		str = str.replaceAll(persianNumbers[i], i).replaceAll(arabicNumbers[i], i);
	}

	return str;

}

export function ssrOptimize<T>(obj: T) {
	try {
		return JSON.parse(JSON.stringify(obj)) as T;
	} catch (e) {
		console.log(e);
		return obj;
	}
}


export function formDataToJson(formData: FormData) {
	let json: { [key: string]: FormDataEntryValue } = {};
	formData.forEach((value, key) => json[key] = value)
	return json;
}
