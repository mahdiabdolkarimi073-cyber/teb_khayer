'use server'

import { getVar } from "@backend/utils/setting";
import { SettingKey } from "@prisma/client";

export async function getCartFees() {
	const [boxFee, postFee] = await Promise.all([
		getVar<string>("PRODUCT_BOX_FEE" as SettingKey),
		getVar<string>("PRODUCT_POST_FEE" as SettingKey),
	]);
	return { boxFee, postFee };
}
