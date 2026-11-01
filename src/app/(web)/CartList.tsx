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
import { IconArrowLeft, IconBuildingStore } from "@tabler/icons-react";

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
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 shadow-2xs">
            <Image src={empty} alt="سبد خرید خالی" width={260} height={200} className="max-w-[220px] h-auto opacity-90" />
            <p className="text-sm font-bold text-gray-800 bg-blue-50/90 border border-blue-200 rounded-xl py-2.5 px-4 shadow-2xs">
              برم تو فروشگاه یه چرخی بزنم حال و هوام عوض شه ✨
            </p>
            <Link
              href="/?openShopPopup=true#shop-popup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all"
            >
              <IconBuildingStore size={16} />
              <span>وب سایت طِب خیّر</span>
              <IconArrowLeft size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartList;
