import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";
import prisma from "@backend/modules/prisma/Prisma";
import AppConfig from "@/config/AppConfig";
import AdminSidebar from "@/app/(web)/admin/AdminSidebar";

export default async function Layout(props: any) {
  const user = await getUserFromCookie();

  if (!user || user?.role !== "ADMIN") {
    if (user && AppConfig.ADMINS.includes(user.phone)) {
      await prisma.user.update({where: {id: user.id}, data: {role: "ADMIN"}});
    } else redirect("/dashboard");
  }

  return (
    <div dir="rtl" style={{background: "#f6f9fc", minHeight: "100vh"}}>
      <AdminSidebar/>
      <div style={{marginRight: 0, padding: "20px 30px 30px 30px", maxWidth: "calc(100% - 200px)", marginLeft: "auto"}}>
        {props.children}
      </div>
    </div>
  );
}
