import { useLocalStorage } from "@mantine/hooks";
import ProductCard from "@/app/(web)/ProductCard";
import { Button, ButtonGroup } from "@mantine/core";
import Link from "next/link";
import ProductCartHandler from "@/app/(web)/product/[id]/ProductCartHandler";
import {
  getCart,
  removeFromCart,
  setLocalCart,
  useCart,
} from "@/utils/localCart";
import { useState } from "react";
import empty from "../../../public/empty.png";
import Image from "next/image";

const CartList = (props: any) => {
  const [second, setSecond] = useState(false);
  const cart = useCart(second);

  return (
    <div>
      <div className={"center justify-between"}>
        <Link href={second ? "#" : "/dashboard/cart"}>
          <Button size={"xs"} disabled={second} color="#158b3f">
            مشاهده سبد خرید
          </Button>
        </Link>
        <Button
          onClick={() => setSecond((p) => !p)}
          size={"xs"}
          color="#1071fe"
        >
          مشاهده سبد خرید {second ? "فعلی" : "بعدی ام"}
        </Button>
      </div>
      <br />
      {second && (
        <p className={"text-red-400 text-sm mb-2"}>
          شما درحال مشاهده سبد خرید بعدی هستید!
        </p>
      )}
      <div className={"flex flex-col gap-2"}>
        {Object.values(cart).length > 0 ? (
          Object.values(cart)?.map?.((c) => (
            <Link key={c.product?.id} href={`/product/${c?.product?.id}`}>
              <ProductCard
                product={c?.product as any}
                footer={
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div className={"center justify-between w-full gap-1"}>
                      <ProductCartHandler
                        {...(c?.product as any)}
                        hideBtn={true}
                        second={second}
                      />
                      {second && (
                        <div className={"center justify-center"}>
                          <Button
                            onClick={() => {
                              removeFromCart(c?.product, true);
                              setLocalCart(c?.product, c.quantity, false);
                            }}
                            size={"xs"}
                          >
                            <span className={"text-break break-words"}>
                              ارسال به <br />
                              سبد خرید فعلی
                            </span>
                          </Button>
                        </div>
                      )}
                      {!second && (
                        <div className={"center justify-center"}>
                          <Button
                            fullWidth
                            variant={"outline"}
                            color={"red"}
                            onClick={() => {
                              setLocalCart(c?.product, c.quantity, true);
                              removeFromCart(c?.product, false);
                            }}
                            size={"xs"}
                            className={"text-break"}
                          >
                            <span className={"text-break break-words"}>
                              ارسال به <br />
                              سبد خرید بعدی
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                }
              />
            </Link>
          ))
        ) : (
          <div>
            <Image src={empty} alt="empty bag" width={480} height={360} />
            <p className=" border-2 border-[#672be3] bg-[#b18fff] rounded-lg py-2 mx-5 text-center">
              سبد خرید من خالی هست چرا 😕
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartList;
