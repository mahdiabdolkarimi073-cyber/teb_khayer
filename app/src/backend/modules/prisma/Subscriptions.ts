import {Prisma, PrismaClient} from ".prisma/client";
import ModelName = Prisma.ModelName;
import PrismaAction = Prisma.PrismaAction;
import UserCreateArgs = Prisma.UserCreateArgs;
import UserUpdateArgs = Prisma.UserUpdateArgs;
import {Course, Order} from "@prisma/client";
import OrderCreateArgs = Prisma.OrderCreateArgs;
import prisma from "@backend/modules/prisma/Prisma";
import CourseCreateArgs = Prisma.CourseCreateArgs;
import CourseUpdateArgs = Prisma.CourseUpdateArgs;
import {handleAppStoreCourse} from "@backend/modules/AppStoreSync";

declare global {
    var PRISMA_SETUP: boolean
}
type Type = {
    name: ModelName,
    action: PrismaAction | PrismaAction[],
    event: (payload: any, result?: any)=>Promise<void>
}

let Subscriptions: Type[] = []
let Filters: Type[] = [];

const AddSubscription = (name: ModelName, action: Prisma.PrismaAction | PrismaAction[], event: (obj: any, payload: any)=>Promise<void>)=>{
    Subscriptions.push({
        name,
        action,
        event
    });
}
const AddFilter = (name: ModelName, action: Prisma.PrismaAction | PrismaAction[], event: (payload: any)=>Promise<void>)=>{
    Filters.push({
        name,
        action,
        event
    });
}

const initialize = ()=>{
    Filters = [];
    Subscriptions = [];

    //@ts-ignore
    const instance: PrismaClient = global.instance;

    instance.$use((async (params, next) => {
        try {
        const validateAction = (t: Type) => {
            return (Array.isArray(t.action) ? t.action.includes(params.action):t.action === params.action)
        }

        await Promise.all((
             Filters.map(async filter => {
                 if (filter.name === params.model && validateAction(filter)) {
                     return await filter.event(params.args);
                 }
             })
        ))

        const result = await next(params);

        Subscriptions.map(sub => {
            if (sub.name === params.model && validateAction(sub)) {

                    sub.event(params.args, result);

            }
        })

        return result;
        } catch (e: any) {
            console.log(`Error in Subscribe!`,e?.message ?? e);
        }
    }));

    console.log("PRISMA SUBSCRIPTION SETUP");
}
export default async function PrismaSubscription() {
    initialize();
    const owners = ['9397791019']

    AddSubscription("Course", ['create', 'update'], async (args: Partial<CourseUpdateArgs>, course: Course)=> {
        handleAppStoreCourse(course, !!args.where).catch(console.error);
    })
    AddSubscription("Order", "create", async (args: OrderCreateArgs, order: Order)=>{
        const user = await prisma.user.findUnique({
            where: {
                id: order?.userId || args.data?.userId
            }
        });

        if (user) {
            await fetch("https://api.sms.ir/v1/send/verify", {
                method: "POST",
                headers: {
                    "X-API-KEY": "EIRbpHiltcCYi0F1DOcpxYOpXfdthSUyJWu1XXThKaRCF8VuGLySVI2cMrBAYIjE",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "mobile": (+user.phone)+"",
                    "templateId": 708945,
                    "parameters": [
                        {
                            "name": "NAME",
                            "value": user.name
                        },
                        {
                            "name": "ID",
                            "value": order.id+""
                        }
                    ]
                })
            }).then(r => r.json())
        }
    })
}
