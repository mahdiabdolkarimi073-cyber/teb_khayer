"use client";

import React, {ReactNode} from "react";
import Link from "next/link";
import {modal} from "@/utils/modal";
import AppDownloadBtn from "@/app/(web)/AppDownloadBtn";

function InfoItem(props: {
    link?: string | ReactNode,
    title: string,
    description: string,
    icon: ReactNode,
    adName?: string
}) {
    return <Link onClick={(e)=>{
        if (typeof props.link !== 'string') {
            e.preventDefault();
            e.stopPropagation();
            modal(props.title, (
                 <div className={'center flex-col gap-3'}>
                     <div className={'center w-full'}>
                         {props.icon}
                     </div>
                     {props.link as any}
                     <div className={'w-full center'}>
                         <AppDownloadBtn size={'sm'} />
                     </div>
                 </div>
            ))
            return false;
        }
    }} href={typeof props.link === 'string' ? props.link:"#"} className={"w-full h-auto"}>
        <div className={"rounded-lg border w-full h-full center gap-2 px-4 p-2 bg-gradient-to-tl from-primary to-secondary text-white"}>
            {props.icon}
            <div>
                <p className={"font-bold"}>{props.title}</p>
                <small className={"text-xs text-gray-100"}>{props.description}</small>
            </div>
        </div>
    </Link>;
}
export default InfoItem;
