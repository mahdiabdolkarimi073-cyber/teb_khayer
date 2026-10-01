'use server'

import { getVar } from "@backend/utils/setting";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";

export async function getTrustInfo() {
	try {
		const [enamad, bank, address, website, phone] = await Promise.all([
			getVar<string>("TRUST_ENAMAD"),
			getVar<string>("TRUST_BANK_ACCOUNT"),
			getVar<string>("TRUST_ADDRESS"),
			getVar<string>("TRUST_WEBSITE"),
			getVar<string>("MAIN_PHONE"),
		]);
		return {
			enamad: enamad ?? SettingKeyInfo.TRUST_ENAMAD?.default ?? "",
			bank: bank ?? SettingKeyInfo.TRUST_BANK_ACCOUNT?.default ?? "",
			address: address ?? SettingKeyInfo.TRUST_ADDRESS?.default ?? "",
			website: website ?? SettingKeyInfo.TRUST_WEBSITE?.default ?? "",
			phone: phone ?? SettingKeyInfo.MAIN_PHONE?.default ?? "",
		};
	} catch (e) {
		console.error('[getTrustInfo] Error, returning defaults:', e instanceof Error ? e.message : String(e));
		return {
			enamad: SettingKeyInfo.TRUST_ENAMAD?.default ?? "",
			bank: SettingKeyInfo.TRUST_BANK_ACCOUNT?.default ?? "",
			address: SettingKeyInfo.TRUST_ADDRESS?.default ?? "",
			website: SettingKeyInfo.TRUST_WEBSITE?.default ?? "",
			phone: SettingKeyInfo.MAIN_PHONE?.default ?? "",
		};
	}
}
