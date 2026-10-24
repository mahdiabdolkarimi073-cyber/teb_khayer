"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import React, {ReactNode, Suspense, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import ApiLoadingState from "@/components/api/ApiLoadingState";
import {useViewportSize} from "@mantine/hooks";
import {Burger, Button} from "@mantine/core";
import {IconChevronDown, IconChevronLeft, IconChevronUp} from "@tabler/icons-react";

export type DashboardSubSection = {
    name: string;
    path: string;
    icon?: any;
};

export type DashboardSection = {
    path: string;
    icon: any;
    name: string;
    subSections?: DashboardSubSection[];
};

export type DashboardType = {
    basePath: string;
    sections: DashboardSection[];
    children: ReactNode;
    title?: string;
    showHeader?: boolean;
};

const DashboardContent = (props: DashboardType) => {
    const [open, setOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const {
        basePath,
        sections,
        title = "",
        showHeader = false
    } = props;
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const {width} = useViewportSize();

    const currentStatus = searchParams?.get("status") || "";
    const sectionList = Array.isArray(sections) ? sections : [];
    const first = sectionList.length > 0 ? sectionList[0] : undefined;

    useEffect(() => {
        if (pathname === basePath && first?.path) {
            router.push(pathname + first.path);
        }
    }, [basePath, first, pathname, router]);

    useEffect(() => {
        setOpen(false);
    }, [pathname, currentStatus]);

    const active = useMemo(() => {
        return sectionList.find(section => section?.path && pathname.startsWith(basePath + section.path)) ?? first;
    }, [pathname, sectionList, basePath, first]);

    const isSectionExpanded = (sectionPath: string) => {
        if (expandedSections[sectionPath] !== undefined) {
            return expandedSections[sectionPath];
        }
        return pathname.startsWith(basePath + sectionPath);
    };

    const toggleSection = (sectionPath: string) => {
        const currentlyExpanded = isSectionExpanded(sectionPath);
        setExpandedSections(prev => ({
            ...prev,
            [sectionPath]: !currentlyExpanded
        }));
    };

    const ActiveIcon = active?.icon ?? IconChevronLeft;
    let ActiveName = active?.name ?? "";
    if (active?.subSections?.length && pathname.startsWith(basePath + active.path)) {
        if (currentStatus === "current") {
            ActiveName = `${active.name} - جاری`;
        } else if (currentStatus === "delivered") {
            ActiveName = `${active.name} - تحویل داده شده`;
        }
    }

    const detailsOpened = width > 756 || !width || open;

    const RIcon = (Icon: any) => {
        if (!Icon) return null;
        return !Icon?.$$typeof?.toString?.()?.includes?.("element") ? <Icon className={'text-xl'}/> : Icon;
    };

    return (
        <div className={'rounded-xl max-w-full mx-auto ' + (showHeader ? "shadow" : "")}>
            {showHeader && (
                <div className={'bg-primary relative p-3 text-white'}>
                    <div className={'w-full flex wrap-center justify-between relative z-10'}>
                        <h3>{title}</h3>
                    </div>
                </div>
            )}
            <div className={'md:flex border flex-nowrap max-w-[100%] justify-between items-stretch gap-2'}>
                <details
                    onClick={(e) => {
                        setOpen(pre => !pre);
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    {...(detailsOpened ? {open: true} : {})}
                >
                    <summary className={'block sm:hidden cursor-pointer'}>
                        <div className={'center justify-between p-2'}>
                            <div className={'center gap-2'}>
                                {RIcon(ActiveIcon)}
                                <p className="font-semibold text-sm">{ActiveName}</p>
                            </div>
                            <Burger color={'blue'} opened={open} onChange={() => setOpen(pre => !pre)} />
                        </div>
                    </summary>
                    {sections.length !== 0 && (
                        <div className={'border-l when-ready'}>
                            <div className={'min-w-[250px] p-2 py-4 gap-2 flex flex-col'}>
                                {sections.map(section => {
                                    const isParentActive = pathname.startsWith(basePath + section.path);
                                    const hasSubSections = Boolean(section.subSections?.length);
                                    const expanded = isSectionExpanded(section.path);
                                    const Icon = RIcon(section.icon);

                                    if (hasSubSections) {
                                        return (
                                            <div key={section.path} className="flex flex-col gap-1 w-full">
                                                <Button
                                                    fullWidth
                                                    variant={isParentActive ? "light" : "subtle"}
                                                    color="blue"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleSection(section.path);
                                                    }}
                                                >
                                                    <div className={'center justify-between w-full'}>
                                                        <div className={'center justify-start gap-2'}>
                                                            {Icon}
                                                            <span>{section.name}</span>
                                                        </div>
                                                        <div className="text-gray-400">
                                                            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                                        </div>
                                                    </div>
                                                </Button>

                                                {expanded && (
                                                    <div className="flex flex-col gap-1 pr-4 mr-2 border-r-2 border-blue-200 mt-0.5">
                                                        {section.subSections?.map(sub => {
                                                            if (!sub?.path) return null;
                                                            const subHref = `${basePath}${sub.path}`;
                                                            let queryStatus = "";
                                                            let subPathBase = sub.path;
                                                            if (sub.path.includes("?")) {
                                                                const parts = sub.path.split("?");
                                                                subPathBase = parts[0] || "";
                                                                const queryString = parts[1] || "";
                                                                const params = new URLSearchParams(queryString);
                                                                queryStatus = params.get("status") || "";
                                                            }
                                                            const isSubActive = pathname === basePath + subPathBase && currentStatus === queryStatus;
                                                            const SubIcon = RIcon(sub.icon);

                                                            return (
                                                                <Link
                                                                    key={sub.path}
                                                                    href={subHref}
                                                                    onClick={() => {
                                                                        if (width <= 756) setOpen(false);
                                                                    }}
                                                                >
                                                                    <Button
                                                                        size="xs"
                                                                        fullWidth
                                                                        variant={isSubActive ? "filled" : "subtle"}
                                                                        color={isSubActive ? "blue" : "gray"}
                                                                        className={`justify-start text-xs rounded-md ${
                                                                            isSubActive ? "font-bold shadow-xs" : "text-gray-600 hover:text-gray-900"
                                                                        }`}
                                                                    >
                                                                        <div className={'center justify-start gap-2 w-full'}>
                                                                            {SubIcon}
                                                                            <span>{sub.name}</span>
                                                                        </div>
                                                                    </Button>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={section.path}
                                            href={`${basePath}${section.path}`}
                                            onClick={() => {
                                                if (width <= 756) setOpen(false);
                                            }}
                                        >
                                            <Button
                                                fullWidth
                                                variant={isParentActive ? "solid" : "flat"}
                                                color={'primary'}
                                            >
                                                <div className={'center justify-start gap-2 w-full'}>
                                                    {Icon}
                                                    <span>{section.name}</span>
                                                </div>
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </details>
                <div className={'flex-grow relative'}>
                    <ApiLoadingState/>
                    <div className={'when-ready p-1 py-3'}>
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = (props: DashboardType) => {
    return (
        <Suspense fallback={null}>
            <DashboardContent {...props} />
        </Suspense>
    );
};

export default Dashboard;
