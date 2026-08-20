import React, {useEffect, useState} from "react";
import {ActionIcon, Button, NumberInput} from "@mantine/core";
import {getCart, removeFromCart, setLocalCart} from "@/utils/localCart";
import {Product} from "@prisma/client";
import {IconTrash} from "@tabler/icons-react";
import {closeLastModal, modal} from "@/utils/modal";
import {_closeCart, _openCart} from "@/app/(web)/WebHeader";

const ProductCartHandler = (props: Product & {remove?: boolean, hideBtn?: boolean,second?: boolean}) => {
	let {id, stock} = props;
	const [quantity, setQuantity] = useState(getCart(props.second)?.[props?.id]?.quantity ?? 0)

	useEffect(() => {
		let final = Math.max(Math.min(quantity, stock), 0);
		setQuantity(final);
		if (final) setLocalCart(props, final,props.second === true)
		else removeFromCart(props,props.second === true);
	}, [quantity]);

	return (
		<>
			<div className="relative flex flex-row w-[150px] h-10 bg-transparent rounded-lg">
				<div className={'center gap-2 w-full'}>
					<ActionIcon
						onClick={() => setQuantity(p => p+1)}>
						+
					</ActionIcon>
					<NumberInput
						style={{minWidth: "50px"}}
						size={'xs'}
						value={quantity}
						color={'primary'}
						onChange={e => setQuantity(+e)}
					/>
					<ActionIcon color={quantity === 1 ? "red":"blue"} onClick={() => {
						if (quantity === 1) {
							_closeCart()
							modal("حذف از سبد خرید", (
								<div>
									<p>آیا میخواهید محصول
										<span className={'mx-1 text-red-400'}> {props.name} </span>
										را از سبد خرید حذف کنید؟</p>
									<div className={'center gap-2'}>
										<Button onClick={()=>{
											removeFromCart(props,props.second)
											closeLastModal();
										}}>
											بله
										</Button>
										<Button onClick={closeLastModal}>
											خیر
										</Button>
									</div>
								</div>
							), {
								onClose: _openCart
							})
						} else setQuantity(p => p-1);
					}}>
						{quantity === 1 ? <IconTrash />:"-"}
					</ActionIcon>
				</div>
			</div>
			{!props.hideBtn && (
				<div className="flex flex-wrap items-center">
					{!props.remove ? (
						<Button disabled={stock <= 0} onClick={() => {
							setLocalCart(props, quantity || 1,props.second);
							alert("به سبد خرید اضافه شد")
						}}>
							{props.stock <= 0 ? "ناموجود" : "افزودن به سبدخرید"}
						</Button>
					) : (
						<Button color={'red'} onClick={() => {
							removeFromCart(props,props.second === true);
						}}>
							حذف
						</Button>
					)}
				</div>
			)}
		</>
	)
}

export default ProductCartHandler;
