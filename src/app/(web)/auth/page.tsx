import { Button } from "@mantine/core";
import Link from "next/link";

function AuthGate(props: {
    login?: string,
    signup?: string
}) {


    return (
        <div className='h-[300px] center flex-col gap-5'>
            <Link href={props.signup ?? "/auth/signup"}>
                <Button size='lg'>
                    ثبت نام
                </Button>
            </Link>
            <Link href={props.login ?? "/auth/login"}>
                <Button size="lg" color='green'>
                    قبلا ثبت نام کرده ام
                </Button>
            </Link>
        </div>
    );
};

export default AuthGate;