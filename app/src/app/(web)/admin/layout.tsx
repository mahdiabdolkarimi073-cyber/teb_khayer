import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";
import prisma from "@backend/modules/prisma/Prisma";
import AppConfig from "@/config/AppConfig";
import AdminSidebar from "@/app/(web)/admin/AdminSidebar";
import styles from "./dashboard/dashboard.module.css";

export default async function Layout(props: any) {
  const user = await getUserFromCookie();

  if (!user || user?.role !== "ADMIN") {
    if (user && AppConfig.ADMINS.includes(user.phone)) {
      await prisma.user.update({where: {id: user.id}, data: {role: "ADMIN"}});
    } else redirect("/dashboard");
  }

  return (
    <div dir="rtl" className={styles.dashboard}>
      <AdminSidebar/>
      <div className={styles.adminContent}>
        {props.children}
      </div>
    </div>
  );
}
