import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";

const Layout = async (props: any) => {
	const user = await getUserFromCookie();

	if (!!user) {
		redirect("/dashboard");
		return;
	}

	return (
		<div className={'my-10 md:min-h-screen center container mx-auto p-3 md:p-0 flex-col'}>
			{props.children}
			<br/>
			<p className={'flex items-center gap-2 flex-wrap text-sm whitespace-nowrap'}>
				شرایط
				<a href={'/privacy/service'} target={"_blank"} className={'text-blue-400'}>استفاده از خدمات</a>
				و
				<a href={'/privacy'} target={"_blank"} className={'text-blue-400'}>حریم خصوصی</a>
				طب خیر را می‌پذیرم.
			</p>
		</div>
	);
}

export default Layout;
