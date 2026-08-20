import { Button, PasswordInput, TextInput } from "@mantine/core";
import React from "react";
import LoginComponent from "@/app/(app)/app/login/LoginComponent";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { redirect } from "next/navigation";
import Link from "next/link";

const Page = async (props: any) => {
  const user = await getUserFromCookie();
  if (!!user) {
    redirect("/app/dashboard");
    return;
  }

  return (
    <div
      className={"min-h-screen center flex-col gap-2 w-full items-stretch p-3"}
    >
      <h3>ورود به حساب کاربری</h3>
      <div className={"center justify-between"}>
        <p>حساب کاربری ندارید؟</p>
        <Link className={"text-primary"} href={"/app/signup"}>
          ثبت نام کنید
        </Link>
      </div>
	  <div className="border border-[#aaa] my-3"></div>
      <LoginComponent />
      <br />
      <p
        className={
          "flex items-center gap-2 flex-wrap text-sm whitespace-nowrap"
        }
      >
        شرایط
        <a
          href={"/privacy/service"}
          target={"_blank"}
          className={"text-blue-400"}
        >
          استفاده از خدمات
        </a>
        و
        <a href={"/privacy"} target={"_blank"} className={"text-blue-400"}>
          حریم خصوصی
        </a>
        طب خیر را می‌پذیرم.
      </p>
    </div>
  );
};

export const metadata = {
  title: "ورود",
};

export default Page;
