"use client";

import { Product } from "@prisma/client";
import { useEffect, useState } from "react";
import { syncUserCartToServer, getUserSavedCartFromServer } from "@/app/(web)/dashboard/cart/cartSync.action";

let syncTimeout: any = null;

function notifyCartUpdate(cartData?: any) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("cart-updated"));

  // Debounced server sync to persist cart for next visits across devices
  if (cartData) {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      try {
        syncUserCartToServer(cartData);
      } catch (e) {
        console.warn("Background cart sync skipped:", e);
      }
    }, 800);
  }
}

export function setLocalCart(product: Partial<Product>, quantity: number, second = false) {
  if (!product?.id) {
    return;
  }

  let cart = getCart(second);

  let pre = cart?.[product?.id] || {
    product: {
      ...product,
      /// @ts-ignore
      price: parseInt(product?.price + "" || "0"),
      category: undefined,
    },
    quantity: 0,
  };

  pre.quantity = quantity;

  cart[product?.id] = pre;
  window.localStorage.setItem(second ? "cart2" : "cart", JSON.stringify(cart));
  notifyCartUpdate(cart);
}

export function bulkSetLocalCart(items: Array<{ product: Partial<Product>; quantity: number }>, second = false) {
  if (typeof window === "undefined") return;
  let cart = getCart(second);

  for (const item of items) {
    if (!item.product?.id) continue;
    cart[item.product.id] = {
      product: {
        ...item.product,
        // @ts-ignore
        price: parseInt(item.product?.price + "" || "0"),
        category: undefined,
      },
      quantity: item.quantity,
    };
  }

  window.localStorage.setItem(second ? "cart2" : "cart", JSON.stringify(cart));
  notifyCartUpdate(cart);
}

export function removeFromCart(product: Partial<Product> | string, second = false) {
  if (typeof window === "undefined") return;
  let cart = getCart(second);
  delete cart[typeof product === "object" ? product.id + "" : product];
  window.localStorage.setItem(second ? "cart2" : "cart", JSON.stringify(cart));
  notifyCartUpdate(cart);
}

export type CartItem = {
  product: Partial<Product>;
  quantity: number;
};

export type CartListType = {
  [key: string]: CartItem;
};

export function getCart(second = false): CartListType {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window?.localStorage.getItem(second ? "cart2" : "cart") || "{}");
  } catch {
    return {};
  }
}

let hydratedFromServer = false;

export function useCart(second = false): CartListType {
  const [cart, setCart] = useState<CartListType>(getCart(second));

  useEffect(() => {
    const update = () => setCart(getCart(second));
    update();

    // Hydrate cart from server if local is empty on first mount
    if (!hydratedFromServer && typeof window !== "undefined") {
      hydratedFromServer = true;
      const local = getCart(second);
      if (Object.keys(local).length === 0) {
        getUserSavedCartFromServer()
          .then((saved) => {
            if (saved && Object.keys(saved).length > 0) {
              window.localStorage.setItem(second ? "cart2" : "cart", JSON.stringify(saved));
              setCart(saved);
              notifyCartUpdate();
            }
          })
          .catch(() => {});
      } else {
        // Sync local to server once on mount
        syncUserCartToServer(local).catch(() => {});
      }
    }

    window.addEventListener("storage", update);
    window.addEventListener("cart-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart-updated", update);
    };
  }, [second]);

  return cart;
}
