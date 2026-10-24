import prisma from "@backend/modules/prisma/Prisma";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";
import {arabicToEnglishNumber} from "@/utils/other";

function settingValueToString(value: unknown): string | undefined {
    if (value == null) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
        return String(value);
    }
    return undefined;
}

export async function getVar<T>(key: string, defaultValue: string | number | boolean | undefined = undefined): Promise<T> {
    const value = (await prisma.setting.findFirst({
        where: {
            key
        }
    }))?.value;

    if (defaultValue === undefined) {
        const info = (SettingKeyInfo as any)?.[key];
        if (info?.default !== undefined) {
            defaultValue = info.default as any;
        }
    }

    const resolved = settingValueToString(value ?? defaultValue);
    return (resolved === undefined ? resolved : arabicToEnglishNumber(resolved)) as T;
}

export async function setVar(key: string, value: string) {
    value = arabicToEnglishNumber(typeof value === "string" ? value : settingValueToString(value) ?? "");
    const pre = await prisma.setting.findUnique({
        where: {
            key
        }
    });

    if (pre) {
        await prisma.setting.update({
            where: {
                id: pre.id
            },
            data: {
                key,
                value
            }
        })
    } else {
        await prisma.setting.create({
            data: {
                key,
                value
            }
        })
    }
}

export async function reloadSettings() {
    await prisma.setting.findMany().then((result)=>{
        // @ts-ignore
        global.settings = {};
        for (let item of result) {
            // @ts-ignore
            global.settings[item.key] = item.value;
        }
    })
}
