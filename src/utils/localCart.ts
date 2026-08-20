"use client";

import {Product} from "@prisma/client";
import {useEffect, useState} from "react";
import {useLocalStorage} from "@mantine/hooks";

export function setLocalCart(product: Partial<Product>, quantity: number,second = false) {
	if (!product?.id) {
		alert("INVALID");
		return;
	}

	let cart = getCart(second);

	let pre = cart?.[product?.id] || {
		product: {
			...product,
			/// @ts-ignore
			price: parseInt(product?.price+"" || "0"),
			category: undefined
		},
		quantity: 0
	}

	pre.quantity = quantity;

	cart[product?.id] = pre;
	window.localStorage.setItem(second ? "cart2":"cart", JSON.stringify(cart));
}

export function removeFromCart(product: Partial<Product> | string,second = false) {
	if (typeof window ==='undefined') return;
	let cart = getCart(second);
	delete cart[typeof product === 'object' ? product.id+"" : product]
	window.localStorage.setItem(second ? "cart2":"cart", JSON.stringify(cart));
}

export type CartItem = {
	product: Partial<Product>,
	quantity: number
}

export type CartListType = {
	[key: string]: CartItem
};

export function getCart(second = false): CartListType  {
	if (typeof window ==='undefined') return {};
	return JSON.parse(window?.localStorage.getItem(second ? "cart2":"cart") || "{}");
}


export function useCart(second = false): CartListType {
	const [cart, setCart] = useState(getCart(second));

	useEffect(() => {
		const thread = setInterval(()=>{
			setCart(getCart(second));
		}, 500);

		return ()=>clearInterval(thread);
	}, [second]);

	return cart;
}
