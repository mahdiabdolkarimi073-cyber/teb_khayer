import {closeLastModal, modal} from "@/utils/modal";
import React, {useState} from "react";
import {Button, TextInput} from "@mantine/core";

export async function inputModal(text: string) {
    return new Promise((resolve, promiseReject) => {
        const Component = ()=>{
            const [input, setInput] = useState("")

            const submit = ()=>{
                if (input) resolve(input);
                closeLastModal();
            }

            const reject = ()=>{
                closeLastModal();
                promiseReject();
            };

            return (
                <div onKeyDown={(e)=>{
                    if (e.key === "Enter") submit()
                    if (e.key === 'ESC') reject();
                }}>
                    <TextInput
                        label={text+"..."}
                        data-autofocus
                        value={input}
                        onChange={(e: any)=>{
                            setInput(e?.target?.value+"")
                        }}
                    />
                    <br/>
                    <div className={'flex gap-2 items-center'}>
                        <Button onClick={submit} variant={'flat'} color={'primary'}>
                            ارسال
                        </Button>
                        <Button onClick={reject} variant={'flat'} color={'primary'}>
                            بستن
                        </Button>
                    </div>
                </div>
            )
        }

        modal(text, <Component />)
    });
}
