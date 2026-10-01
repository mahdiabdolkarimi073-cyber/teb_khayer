"use client";

import {usePathname, useRouter} from "next/navigation";
import React, {Component, FunctionComponent, ReactNode, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import ApiLoadingState from "@/components/api/ApiLoadingState";
import {useViewportSize} from "@mantine/hooks";
import {Burger, Button} from "@mantine/core";
import Loading from "@/components/loading";
import {IconChevronLeft} from "@tabler/icons-react";

export type DashboardType = {
    basePath: string,
    sections: {
        path: string,
        icon: any,
        name: string
    }[],
    children: ReactNode,
    title?: string,
    showHeader?: boolean
}

const Dashboard = (props: DashboardType) => {
    const [open, setOpen] = useState(false)
    const {
        basePath,
        sections,
        title = "",
        showHeader = false
    } = props;
    const pathname = usePathname();
    const router = useRouter();
    const {width} = useViewportSize();

    const first =sections[0];

    useEffect(() => {
        if (pathname === basePath && first) {
            router.push(pathname+first.path);
        }
    }, []);
    useEffect(()=>{
        setOpen(false);
    }, [pathname])

    const active = useMemo(()=>{

        return sections.find(section => pathname.startsWith(basePath+section.path)) ?? first;
    }, [pathname, sections]);
    const {icon: ActiveIcon = IconChevronLeft, name: ActiveName = ""} = active ?? {};

    const detailsOpened = width > 756 || !width || open;

    const RIcon = (Icon: any) => {
        return !Icon?.$$typeof?.toString?.()?.includes?.("element") ? <Icon className={'text-xl'}/>:Icon;
    }

    return (
        <div className={'rounded-xl max-w-full mx-auto '+(showHeader && "shadow")}>
            {showHeader && (
                <div className={'bg-primary relative p-3 text-white'}>
                    <div className={'w-full flex wrap-center justify-between relative z-10'}>
                        <h3>{title}</h3>
                    </div>
                </div>
            )}
            <div className={'md:flex border flex-nowrap max-w-[100%] justify-between items-stretch gap-2'}>
                <details onClick={(e)=>{
                    setOpen(pre => !pre);
                    e.stopPropagation();
                    e.preventDefault();
                }} {...(detailsOpened && {open: true})}>
                    <summary className={'block sm:hidden cursor-pointer'}>
                        <div className={'center justify-between p-2'}>
                            <div className={'center gap-2'}>
                                {RIcon(active?.icon)}
                                <p>{ActiveName}</p>
                            </div>
                            <Burger color={'blue'} opened={open} onChange={()=>setOpen(pre => !pre)} />
                        </div>
                    </summary>
                    {sections.length !== 0 && (
                        <div className={' border-l when-ready'}>
                            <div className={'min-w-[250px] p-2 py-4 gap-2 flex flex-col'}>
                                {sections.map(section => {
                                    const isActive = active?.path === section.path;
                                    const Icon = RIcon(section.icon);
                                    return (
                                        <Link href={`${basePath}${section.path}`}>
                                            <Button key={section.path} fullWidth variant={isActive ? "solid" : 'flat'}
                                                    color={'primary'}>
                                                <div className={'center justify-start gap-2 w-full'}>
                                                    {Icon}
                                                    {section.name}
                                                </div>
                                            </Button>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </details>
                <div className={'flex-grow  relative'}>
                    <ApiLoadingState/>
                    <div className={'when-ready p-1 py-3'}>
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Dashboard;
