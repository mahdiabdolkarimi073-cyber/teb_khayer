'use client';

import prisma from "@backend/modules/prisma/Prisma";
import {useEffect, useState} from "react";
import {getServiceDetails} from "@/app/(web)/admin/services/[service]/list/action";
import {ActionIcon, TextInput} from "@mantine/core";
import {IconX} from "@tabler/icons-react";
import {useRouter} from "next/navigation";
import {handlePrismaQuery} from "@/app/(web)/admin/action";

type Details = Awaited<ReturnType<typeof getServiceDetails>>;
const UserListView = (props: {
    details: Details
}) => {
	let {details} = props;
    const all = details.users;
    const [view, setView] = useState(details.users);
    const router = useRouter();

	useEffect(() => {
		setView(details?.users)
	}, [details]);

	return (
		<div>
			<TextInput
				label={'جستجو'}
				placeholder={'شماره تلفن، نام...'}
				onChange={(e)=>{
					const value = e?.target?.value;

					if (!!value)
						setView(all?.filter(i =>
							JSON.stringify(Object.values(i.user)).includes(value)
						));
					else
						setView(all);
				}}
			/>
			<br/>
			<h5 className={'text-center'}>کاربران ثبت نام شده</h5>
              {view.map((item, i) => (
                   <div key={item.id+":"+i} className={'center justify-between border p-2 my-1'}>
                       <p>{item!.user.name} ({item!.user.phone})</p>
				    <div className={'center gap-1'}>
					    <p>{new Date(item.paid_at).toLocaleString('fa')}</p>
					    <ActionIcon color={'red'} onClick={()=>{
						    alert('درحال غیرفعال سازی...')
						    handlePrismaQuery("serviceUser", "delete", {
							    where: {
								    id: +item.id
							    }
						    }).then(()=>{
							    alert("غیرفعال شد");
							    router.refresh()
						    });
					    }} size={'xs'}>
						    <IconX />
					    </ActionIcon>
				    </div>
			    </div>
		    ))}
			{!view?.length && (
				<div className={'min-h-[100px] center'}>
					<h4>موردی یافت نشد</h4>
				</div>
			)}
		</div>
	)
}

export default UserListView;
