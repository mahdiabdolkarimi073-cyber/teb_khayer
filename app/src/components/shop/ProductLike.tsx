"use client";

import {useAction} from "@/utils/server";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import React, {useEffect, useState, useTransition} from "react";

import {Prisma} from "@prisma/client";
import {IconHeart, IconHeartFilled, IconHearts} from "@tabler/icons-react";
import {ActionIcon} from "@mantine/core";
import {useRouter} from "next/navigation";
import ProductLikeFindFirstArgs = Prisma.ProductLikeFindFirstArgs;

const ProductLike = (props: { id: string, liked?: boolean }) => {
	const [liked, setLiked] = useState<any>(!!props?.liked);
	const {result: user, isPending} = useAction(getUserFromCookie);
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!!user) {

			const handleCheck = async () => {
				setIsLoading(true);
				const liked = await handlePrismaQuery<ProductLikeFindFirstArgs>('productLike', 'findFirst', {
					where: {
						userId: user?.id,
						productId: props?.id
					}
				});

				setLiked(liked);
				setIsLoading(false);
			}
			handleCheck();
		}
	}, [user]);

	return (
		<ActionIcon disabled={isLoading} onClick={async () => {
			if (isPending) return;
			if (!user) {
				alert("ابتدا باید وارد شوید");
				router.push("/auth/login");
				return;
			}

			setIsLoading(true);
			if (!!liked) {
				await handlePrismaQuery("productLike", 'delete', {
					where: {
						id: liked?.id
					}
				})
				setLiked(false);
			} else {
				const liked = await handlePrismaQuery("productLike", 'create', {
					data: {
						userId: user?.id,
						productId: props?.id
					}
				});
				setLiked(liked);
			}
			setIsLoading(false);

		}} variant="default" radius="md" size={'lg'} className={'text-red-500'}>
			{liked ? <IconHearts stroke={1.5} color={'red'} fill={'red'}/> : <IconHeart stroke={1.5} color={'red'}/>}
		</ActionIcon>
	)
}

export default ProductLike;
