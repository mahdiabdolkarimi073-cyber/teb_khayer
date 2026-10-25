import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";
import Dashboard from "@/components/ui/Dashboard";
import {
    IconCircleCheck,
    IconClock,
    IconGardenCart,
    IconHeart,
    IconListDetails,
    IconLogout,
    IconMapPin,
    IconSettings,
    IconShoppingCart,
    IconHeadphones
} from "@tabler/icons-react";

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
                    subSections: [
                        {
                            name: "جاری",
                            path: "/orders?status=current",
                            icon: <IconClock size={16} />
                        },
                        {
                            name: "تحویل داده شده",
                            path: "/orders?status=delivered",
                            icon: <IconCircleCheck size={16} />
                        }
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
                    name: "پشتیبانی و درخواست‌های من",
                    path: "/support",
                    icon: <IconHeadphones />
                },
                {
                    name: "تنظیمات و حساب من",
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
