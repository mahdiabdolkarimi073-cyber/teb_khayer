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
			<div className={'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6'}>
				{categories?.map?.(category => (
					<a href={'#app'} key={category?.id}>
						<div className={'center flex-col gap-2 w-full'}>
							<div className={'rounded-full relative overflow-hidden w-[88px] h-[88px] sm:w-[100px] sm:h-[100px]'}>
								<img loading='lazy' src={category?.thumbnail} alt={category?.name}
									className={'w-full h-full rounded-full shadow object-cover'}/>
								{category?._count?.courses === 0 && category?._count?.children === 0 && (
									<div className={'absolute left-0 top-0 w-full h-full  center'}>
										<div className={'bg-black/50 text-white  py-2 w-full font-bold center'}>
											به زودی
										</div>
									</div>
								)}
							</div>
							<Text lineClamp={1} className={'text-center w-full'}>{category?.name}</Text>
						</div>
					</a>
				))}
			</div>
		</div>
	)
}

export default HomeCourseCategoryList;
