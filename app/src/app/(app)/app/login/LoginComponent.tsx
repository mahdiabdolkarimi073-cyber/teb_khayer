"use client";

import { Button, NumberInput, PasswordInput } from "@mantine/core";
import { handleLogin, handleNewPassword } from "@/app/(app)/app/login/action";
import React, { useState } from "react";
import { phoneVerify } from "@/app/(app)/app/signup/SignupComponent";
import { closeLastModal, modal } from "@/utils/modal";
import { checkExists } from "@/app/(app)/app/signup/action";
import styles from "./login.module.css";

const LoginComponent = (props: { glass?: boolean }) => {
  const [wrongPass, setWrongPass] = useState("");

  return (
    <div className={props.glass ? styles.formCard : undefined}>
      {!props.glass && <p className="text-green-500 font-bold mb-3">قبلا ثبت نام کرده ام.</p>}
      <form action={async (formData: FormData) => {
        const phone = formData.get("phone") + "";
        const password = formData.get("password") + "";
        const message = await handleLogin(phone, password);
        if (message.includes("رمزعبور")) setWrongPass(phone);
        alert(message);
      }} className="flex flex-col gap-2">
        <NumberInput label="شماره تلفن" name="phone" placeholder="09...." />
        <PasswordInput
          label="رمزعبور"
          name="password"
          placeholder="****"
          {...(wrongPass && {
            error: <Button onClick={() => forgotPassword(wrongPass)} variant="outline" color="red" size="xs">فراموشی رمزعبور</Button>,
          })}
        />
        <div className="center">
          <Button type="submit">ورود</Button>
        </div>
      </form>
    </div>
  );
};

export async function forgotPassword(phone: string) {
  if (!(await checkExists(phone))) {
    alert("شماره تلفن یافت نشد");
    return;
  }
  const verify = await phoneVerify(phone);
  if (!verify) return;

  modal("رمزعبور جدید", (
    <form action={async (form) => {
      const pass = form.get("password");
      const repeatPassword = form.get("repeatPassword");
      if (pass !== repeatPassword) {
        alert("تکرار رمزعبور اشتباه است");
        return;
      }
      const message = await handleNewPassword(phone, pass + "");
      alert(message);
      if (message === "رمزعبور تغییر یافت") closeLastModal();
    }}>
      <PasswordInput label="رمزعبور جدید" name="password" placeholder="****" />
      <PasswordInput label="تکرار رمزعبور جدید" name="repeatPassword" placeholder="****" />
      <br />
      <Button type="submit">تغییر رمزعبور</Button>
    </form>
  ));
}

export default LoginComponent;
