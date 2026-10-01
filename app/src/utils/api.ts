import {_SET_API_LOADING} from "@/components/api/ApiLoadingState";
import {HTTP_METHOD} from "next/dist/server/web/http";
import {updateFile} from "@backend/utils/file";

type KeyOnly<T> = {
    [K in keyof T]: any
} | {}

type bodyType = {
    [key: string]: any
} | FormData

export default async function api<T = bodyType, R = any>(path: string, data: KeyOnly<T> = {}, method: HTTP_METHOD = "POST") {
    // @ts-ignore
    const isSilent = !!data?._silent || !!data?.__silent;
    try {
        if (typeof window !== 'undefined' && !isSilent) {
            _SET_API_LOADING(true);
        }


        const response = await fetch("/api" + path, {
            method,
            ...(method !== "GET" && {body: (data instanceof FormData ? data : JSON.stringify(data))}),
        });

        if (typeof window !== 'undefined') {
            _SET_API_LOADING(false);
        }
        const json = await response.json();
        if (!json.ok) {
            throw(json);
        }
        return json as {data: R, ok: boolean, total?: number, message?: string};
    } catch (e: any) {
        if (typeof window !== 'undefined') {
            _SET_API_LOADING(false);
        }
        if (!isSilent) alert(e?.message ?? e);
        throw(e);
    }
}

export async function uploadFile(file: File, path: string): Promise<string> {
    const formData = new FormData();
    formData.set('file', file);
    formData.set('path', path);
    const res = await api("/core/upload",formData, "POST");

    return res?.data?.path;
}
