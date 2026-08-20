import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";
import SignupComponent from "@/app/(app)/app/signup/SignupComponent";

const Page = async (props: any) => {
	const user = await getUserFromCookie();
	if (!!user) {
		redirect("/app/dashboard");
		return;
	}

	return (
		<div className={'min-h-screen center p-4 flex-col items-stretch gap-2'}>
			<h2>ثبت نام</h2>
			<SignupComponent/>
			<br/>
			<p className={'flex items-center gap-2 flex-wrap text-sm whitespace-nowrap'}>
				شرایط
				<a href={'/privacy/service'} target={"_blank"} className={'text-blue-400'}>استفاده از خدمات</a>
				و
				<a href={'/privacy'} target={"_blank"} className={'text-blue-400'}>حریم خصوصی</a>
				طب خیر را می‌پذیرم.
			</p>
		</div>
	)
}

export const metadata = {
	title: "ثبت نام"
}

export default Page;
