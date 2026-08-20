"use client";

import {useEffect} from "react";
import Loading from "@/app/(app)/loading";

const Page = (props: any) => {
    const {token} = props.searchParams;

    useEffect(()=>{
        window.doPayment(token);
    }, [])

	return (
		<div>
              <Loading />
		</div>
	)
}

export default Page;
