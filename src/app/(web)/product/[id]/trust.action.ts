'use server'

import { getVar } from "@backend/utils/setting";
import { SettingKey } from "@prisma/client";

export async function getTrustInfo() {
	const [enamad, bank, address, website, phone] = await Promise.all([
		getVar<string>("TRUST_ENAMAD" as SettingKey),
		getVar<string>("TRUST_BANK_ACCOUNT" as SettingKey),
		getVar<string>("TRUST_ADDRESS" as SettingKey),
		getVar<string>("TRUST_WEBSITE" as SettingKey),
		getVar<string>("MAIN_PHONE" as SettingKey),
	]);
	return { enamad, bank, address, website, phone };
}
