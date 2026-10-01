import React from "react";
import {Category} from "@prisma/client";

const CategoryView = (c: Category & {soon?: boolean}) => {

	return (
		<div className={' center flex-col gap-2 border rounded-2xl overflow-hidden h-full justify-between bg-white shadow p-2'}>
			<div className={'relative'}>
				<img loading={'lazy'} src={c.thumbnail} alt={c.name}
					className={'w-full h-[150px] object-cover rounded-xl'}/>
				{c?.soon && (
					<div className={'absolute left-0 top-0 w-full h-full  center'}>
						<div className={'bg-black/50 text-white  py-2 w-full font-bold center'}>
							به زودی
						</div>
					</div>
				)}
			</div>
			<div className={'center h-fit flex-grow w-full'}>
				<h5 className={'text-center'}>{c.name}</h5>
			</div>
		</div>
	)
}

export default CategoryView;
