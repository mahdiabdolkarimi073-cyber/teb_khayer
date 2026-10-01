import { getUserFromCookie } from "@/utils/serverComponents/user";
import { redirect } from "next/navigation";

const Layout = async (props: any) => {
  const user = await getUserFromCookie();

  if (!!user) {
    redirect("/dashboard");
    return;
  }

  return <div className="min-h-screen w-full">{props.children}</div>;
};

export default Layout;
