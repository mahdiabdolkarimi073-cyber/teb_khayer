import prisma from "@backend/modules/prisma/Prisma";
import {Text} from "@mantine/core";
import {IconSparkles} from "@tabler/icons-react";
import React from "react";
import Link from "next/link";

const HomeCourseCategoryList = async (props: any) => {
	const categories = await prisma.category.findMany({
		take: 12,
		include: {
			_count: {
				select: {
					courses: true,
					children: true
				}
			}
		},
		orderBy: {
			created_at: "asc"
		},
		where: {
			parentId: {
				equals: null
			}
		}
	});



	return (
		<div className={'container mx-auto'}>
			<div className={'center justify-between'}>
				<div className="center gap-2">
					<IconSparkles size={'2rem'} className={'text-primary'}/>
					<h3>دوره ها</h3>
				</div>
			</div>
			<br/>
			<div className={'grid lg:grid-cols-8 md:grid-cols-6 sm:grid-cols-4 grid-cols-2  gap-10 container mx-auto flex-wrap wrap'}>
				{categories?.map?.(category => (
					<a href={'#app'}>
						<div style={{width: "100px"}} className={'center flex-col gap-2'}>
							<div className={'rounded-full relative overflow-hidden'}>
								<img loading='lazy' src={category?.thumbnail} alt={category?.name}
									className={'w-[100px] h-[100px] rounded-full shadow object-cover'}/>
								{category?._count?.courses === 0 && category?._count?.children === 0 && (
									<div className={'absolute left-0 top-0 w-full h-full  center'}>
										<div className={'bg-black/50 text-white  py-2 w-full font-bold center'}>
											به زودی
										</div>
									</div>
								)}
							</div>
							<Text lineClamp={1} className={'text-center'}>{category?.name}</Text>
						</div>
					</a>
				))}
			</div>
		</div>
	)
}

export default HomeCourseCategoryList;
