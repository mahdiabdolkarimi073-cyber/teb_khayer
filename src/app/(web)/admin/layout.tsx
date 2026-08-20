import Dashboard from "@/components/ui/Dashboard";
import {IconCategory, IconCategory2, IconList, IconMenuOrder, IconTicket, IconUsers} from "@tabler/icons-react";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";

import prisma from "@backend/modules/prisma/Prisma";
import AppConfig from "@/config/AppConfig";

export default async function Layout(props: any) {
	const user = await getUserFromCookie();

	if (!user || user?.role !== "ADMIN") {
		if (user && AppConfig.ADMINS.includes(user.phone)) {
			await prisma.user.update({
				where: {
					id: user?.id
				},
				data: {
					role: "ADMIN"
				}
			})
		} else redirect("/dashboard");
	}

	return (
		<div className={'mx-auto container my-10'}>
			<Dashboard sections={[
				{
					name: "دوره ها",
					path: "/courses",
					icon: <IconCategory/>
				},
				{
					name: "دانشجویان",
					path: "/students",
					icon: <IconList/>
				},
				{
					name: "محصولات",
					path: "/products",
					icon: <IconCategory2/>
				}, {
					name: "سفارشات",
					path: "/orders",
					icon: <IconList/>
				}, {
					name: "کاربران",
					path: "/users",
					icon: <IconUsers/>
				}, {
					name: "تنظیمات",
					path: "/services",
					icon: <IconTicket/>
				}
			]} basePath={"/admin"} children={props.children} />
		</div>
	)
}
