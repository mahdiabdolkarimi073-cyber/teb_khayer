"use client";

import {Button, NumberInput, PasswordInput, PinInput, TextInput} from "@mantine/core";
import {handleLogin} from "@/app/(app)/app/login/action";
import React, {useEffect, useState} from "react";
import {checkCode, checkExists, handleSignup, sendCode} from "@/app/(app)/app/signup/action";
import {closeLastModal, modal} from "@/utils/modal";

const SignupComponent = (props: any) => {

	return (
          <div>
              <form action={async (formData: FormData) => {
                   const args: string[] = [];
                   formData.forEach((value) => args.push(value+""));
                   if (formData.get('password') !== formData.get('repeat')) {
                        alert("تکرار رمزعبور اشتباه است");
                        return;
                   }
                   const phone = formData.get('phone')+"";
                   if (await checkExists(phone)) {
                        alert("شماره تلفن از قبل ثبت شده است");
                        return;
                   }
                   if (await phoneVerify(phone)) {
                        //@ts-ignore
                        const message = await handleSignup(...args);

                        alert(message);
                   }
              }} className={'flex flex-col gap-2'}>
                   <TextInput
                        label={'نام و نام خانوادگی'}
                        required
                        name={'name'}
                        placeholder={'نام...'}
                   />
                  <NumberInput
                       required
                       label={'شماره تلفن'}
                       name={'phone'}
                       placeholder={'09....'}
                  />
                   <div className={'center w-full gap-2'}>
                        <PasswordInput
                             required
                             className={'flex-grow'}
                             label={'رمزعبور'}
                             name={'password'}
                             placeholder={'****'}
                        />
                        <PasswordInput
                             required
                             label={'تکرار رمزعبور'}
                             className={'flex-grow'}
                             name={'repeat'}
                             placeholder={'****'}
                        />
                   </div>
                  <div className={'center mt-2'}>
                      <Button type={'submit'}>
                          ثبت نام
                      </Button>
                  </div>
              </form>
          </div>
     )
}

export async function phoneVerify(phone: string): Promise<boolean> {
     const send = async ()=>alert((await sendCode(phone))?.message);
     await send();



     return await new Promise((resolve, reject) => {
          modal((
               <div className={'center gap-1'}>
                    <p>کد تایید</p>
                    <Button size={'xs'} variant={'outline'} onClick={send}>
                         ارسال مجدد
                    </Button>
               </div>
          ), <PhoneVerify onEnd={async (code)=>{
               const check = await checkCode(phone, code);
               if (check?.ok) {
                    closeLastModal();
                    resolve(true);
               } else alert(check?.message || "کد تایید اشتباه است")
          }}  />, {
               onClose: ()=>resolve(false)
          })
     })
}

const PhoneVerify = (props: {onEnd: (code: string)=>void})=>{
     const [code, setCode] = useState("");

     useEffect(() => {
          if (code?.length === 6) {
               props?.onEnd?.(code);
          }
     }, [code]);

     return (
          <div className={'center flex-col gap-2'}>
               <h3>کد تایید را وارد کنید</h3>
               <PinInput type={'number'} dir={'ltr'} value={code} onChange={setCode} length={6} oneTimeCode  />
          </div>
     )
}

export default SignupComponent;
