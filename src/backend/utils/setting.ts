import prisma from "@backend/modules/prisma/Prisma";
import { SettingKeyInfo } from "@/generated/SettingKey.enum";
import {arabicToEnglishNumber} from "@/utils/other";

export async function getVar<T>(key: string, defaultValue: string | undefined = undefined): Promise<T> {
    const value = (await prisma.setting.findFirst({
        where: {
            key
        }
    }))?.value;

    if (!defaultValue) {
        const info = (SettingKeyInfo as any)?.[key];
        if (info?.default !== undefined) {
            defaultValue = info.default as any;
        }
    }

    return arabicToEnglishNumber(value ?? defaultValue) as T;
}

export async function setVar(key: string, value: string) {
    value = arabicToEnglishNumber(value);
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
