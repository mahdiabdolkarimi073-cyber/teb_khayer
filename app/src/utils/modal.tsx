import {ReactNode} from "react";
import {modals} from "@mantine/modals";
// @ts-ignore
import {ModalSettings, OpenConfirmModal} from "@mantine/modals/lib/context";
import ApiLoadingState from "@/components/api/ApiLoadingState";


export function modal(title: ReactNode | string,children: ReactNode, options: ModalSettings = {}) {

    let defaultConfig = {
        title,
        children: (
             <div className={'relative w-full'}>
                 <ApiLoadingState/>
                 {children}
             </div>
        ),
        centered: true,
    }
    return modals.open({
        ...defaultConfig,
        ...options,
    })
}


export function closeLastModal() {
    // @ts-ignore
    window.document.querySelectorAll(".mantine-Modal-close")?.[0]?.click?.();
}
