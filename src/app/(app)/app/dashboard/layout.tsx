import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";

const Layout = async (props: any) => {
	const user = await getUserFromCookie();
	if (!user) {
		redirect("/app/login");
		return;
	}

	return props.children
}

export default Layout;
