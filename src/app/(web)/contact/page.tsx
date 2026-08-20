"use client";
import {ActionIcon, rem, SimpleGrid, Text, Title,} from '@mantine/core';

import socials, {SocialIcon, SocialsComponent, socialsNames} from "@/app/(web)/contact/socials";
import AppConfig from "@/config/AppConfig";
import React from "react";


export function ContactUs() {

  return (
    <div className={" lg:p-10 p-5 text-black container mx-auto"}>
      <>
        <div className="container my-10 mx-auto md:px-6">
          <section className="mb-32">
            <div className="block rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
              <div className="flex flex-wrap items-center">
                <div className="block w-full shrink-0 grow-0 basis-auto lg:flex lg:w-6/12 xl:w-4/12">
                  <div className="h-[300px] md:h-[500px] w-full">
                    <iframe
                         src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1600903.7788177046!2d46.782780605598724!3d38.40067786579188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40187bd58365be6f%3A0xa184329c761eafd5!2sArdabil%20Province%2C%20Iran!5e0!3m2!1sen!2sde!4v1708017327161!5m2!1sen!2sde"
                         style={{border: 0}}
                         className={'h-full w-full'}
                         loading="lazy"
                         referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
                <div className="w-full shrink-0 grow-0 basis-auto lg:w-6/12 xl:w-8/12  lg:py-3">
                  <div className="flex flex-wrap px-3 pt-12 pb-12 md:pb-0 lg:pt-0 ">
                    {Object.entries(AppConfig.contact).map(([key, link]) => {
                      key = key.toUpperCase();
                      const name = socialsNames[key as keyof typeof socialsNames];
                      const username = link?.split?.("/")?.pop()?.split(":")?.pop() || "";

                      return (
                           <a href={link} target={"_blank"}>
                             <div className="mb-12 w-full shrink-0 grow-0 basis-auto px-3 md:w-6/12 md:px-6 lg:w-full xl:w-6/12 xl:px-12">
                               <div className="flex items-start">
                                 <div className="shrink-0">
                                   <div className="inline-block rounded-md bg-primary-100 p-4 text-primary">
                                     <SocialIcon style={{width: "2rem", height: "2rem"}} social={key}/>
                                   </div>
                                 </div>
                                 <div className="ml-6 grow">
                                    <p className="mb-2 font-bold dark:text-white">
                                      {name}
                                    </p>

                                    <div className="text-neutral-500 dark:text-neutral-200 overflow-hidden">
                                      <Text lineClamp={1}>
                                        {username.slice(0, 20)}
                                      </Text>

                                      <Text className="text-primary text-xs text-nowrap">
                                        جهت مکالمه کلیک کنید
                                      </Text>
                                    </div>
                                  </div>
                               </div>
                             </div>
                           </a>
                        )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Section: Design Block */}
          </div>
          {/* Container for demo purpose */}
        </>
    </div>
  );
}

export default ContactUs;
