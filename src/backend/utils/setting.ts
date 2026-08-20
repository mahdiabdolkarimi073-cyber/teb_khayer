'use server';

import {$Enums} from ".prisma/client";
import prisma from "@backend/modules/prisma/Prisma";
import SettingKey = $Enums.SettingKey;
import { Prisma } from "@prisma/client";
import {handlePrismaModuleDocumentation} from "../../../prisma/PrismaInfo";
import {arabicToEnglishNumber} from "@/utils/other";

export async function getVar<T>(key: keyof typeof SettingKey, defaultValue: string | undefined = undefined): Promise<T> {
    // @ts-ignore
    const value = (await prisma.setting.findFirst({
        where: {
            key
        }
    }))?.value;

    if (!defaultValue) {
        const enums = Prisma.dmmf.datamodel.enums;
        const settingKeys = enums.find((e) => e.name === "SettingKey");
        if (settingKeys) {
            const target = settingKeys.values.find(v => v.name === key);
            // @ts-ignore
            const info = handlePrismaModuleDocumentation(target?.documentation as string);
            if (info.default) {
                defaultValue = info.default as any;
            }
        }
    }

    return arabicToEnglishNumber(value ?? defaultValue) as T;
}

export async function setVar(key: keyof typeof SettingKey, value: string) {
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
