import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";
import Dashboard from "@/components/ui/Dashboard";
import {IconGardenCart, IconHeart, IconListDetails, IconLogout, IconMapPin, IconSettings, IconShoppingCart} from "@tabler/icons-react";

const Layout = async (props: any)=>{
    const user = await getUserFromCookie();
    if (!user) {
        redirect("/auth/login");
    }

    return (
        <div className={'container mx-auto my-10'}>
            <h3 className={'text-center'}>{user.name} - {user?.phone}</h3>
            <br/>
            <Dashboard basePath={'/dashboard'} sections={[
                {
                    name: "سبد خرید من",
                    path: "/cart",
                    icon: <IconShoppingCart />
                },
                {
                    name: "تسویه و پرداخت",
                    path: "/checkout",
                    icon: <IconGardenCart />
                },
                {
                    name: "لیست سفارشات من",
                    path: "/orders",
                    icon: <IconListDetails />,
                    children: [
                        {path: "/orders?status=current", name: "جاری"},
                        {path: "/orders?status=delivered", name: "تحویل داده شده"}
                    ]
                },
                {
                    name: "لیست علاقه مندی های من",
                    path: "/favorite",
                    icon: <IconHeart />
                },
                {
                    name: "آدرس‌های من",
                    path: "/addresses",
                    icon: <IconMapPin />
                },
                {
                    name: "تنظیمات",
                    path: "/settings",
                    icon: <IconSettings />
                },
                {
                    name: "خروج",
                    path: "/logout",
                    icon: <IconLogout />
                }
            ]} children={props?.children} />
        </div>
    )
}

export default Layout;