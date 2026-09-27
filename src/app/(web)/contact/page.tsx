import { getVar } from "@backend/utils/setting";
import { ContactUs } from "@/app/(web)/contact/ContactUs";
import AppConfig from "@/config/AppConfig";

export const dynamic = 'force-dynamic';

export default async function Page() {
	const basalamLink = await getVar<string>('BASALAM_LINK');

	const contactOverride: Record<string, string> = { ...AppConfig.contact };
	if (basalamLink) {
		contactOverride["basalam"] = basalamLink;
	}

	return <ContactUs contact={contactOverride} />;
}
