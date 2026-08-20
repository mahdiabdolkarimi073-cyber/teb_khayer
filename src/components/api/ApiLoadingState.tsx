"use client";
import React, {useEffect, useRef, useState} from "react";
import {generateRandomString} from "@backend/utils/string";
import {LoadingOverlay} from "@mantine/core";


declare const window: {
    API_HOOKS: any
}

export let _SET_API_LOADING = (state: boolean)=>{
    Object.values(typeof window !== 'undefined' ? window?.API_HOOKS || {}:{}).forEach((h: any) => h?.(state));
}

let _LOADERS: string[] = [];

const ApiLoadingState = (props: {force?: boolean}) => {
    return null; // ignored due to unhandled loader
}

export function useApiLoading(hookId = "loading") {
    const id = useRef(`${hookId}_`+generateRandomString(5));
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        window.API_HOOKS  ??= {};
        window.API_HOOKS[id.current] = (state: boolean)=>{
            setLoading(state);
        };
        return ()=>{
            delete window.API_HOOKS[id.current]
        }
    }, [])

    return loading;
}

export default ApiLoadingState;
