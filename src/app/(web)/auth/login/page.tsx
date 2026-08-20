import LoginComponent from "@/app/(app)/app/login/LoginComponent";
import React from "react";
import Link from "next/link";

const Page = (props: any) => {
  return (
    <div className={"md:w-1/3 w-full"}>
      <br />
      <p>حساب کاربری ندارید؟</p>
      <Link href={"/auth/signup"} className={"text-primary font-bold"}>
         ثبت نام میکنم
      </Link>
	  <div className="border border-[#aaa] my-3"></div>
      <LoginComponent />
    </div>
  );
};

export default Page;
