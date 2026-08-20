"use client";
import { getCart, removeFromCart, useCart } from "@/utils/localCart";
import React, { useState } from "react";
import {
  ActionIcon,
  Button,
  Combobox,
  ScrollArea,
  Table,
  TextInput,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { CheckoutFields } from "@/app/(web)/dashboard/checkout/checkout.fields";
import { formDataToJson } from "@/utils/other";
import { SettingKey, User } from "@prisma/client";
import { useAction } from "@/utils/server";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import Loading from "@/app/(app)/loading";
import { createOrderPortal } from "@/app/(web)/dashboard/checkout/checkout.action";
import { _openCart } from "@/app/(web)/WebHeader";
import { getVar } from "@backend/utils/setting";
import Empty = Combobox.Empty;
import Link from "next/link";

const Page = (props: any) => {
  const router = useRouter();
  const { result: user, isPending } = useAction(getUserFromCookie);
  const { result: BOXFee, isPending: BOXFeePending } = useAction(
    getVar,
    "PRODUCT_BOX_FEE" as SettingKey
  );
  const { result: POSTFee, isPending: POSTFeePending } = useAction(
    getVar,
    "PRODUCT_POST_FEE" as SettingKey
  );
  const cart = useCart();
  const finalData = Object.values(cart).map(({ product, quantity }) => ({
    name: product.name,
    quantity: quantity + " عدد",
    price: product.price,
    final: parseInt(product.price + "") * quantity,
  }));
  const rows = finalData.map((row, i) => (
    <Table.Tr key={row.name}>
      {Object.values(row)?.map((v) => (
        <Table.Td>
          {typeof v === "number" ? v.toLocaleString("fa") + " تومان" : v + ""}
        </Table.Td>
      ))}
      <Table.Td>
        <ActionIcon
          onClick={() => {
            removeFromCart(Object.values(cart)?.[i]?.product);
          }}
          color={"red"}
        >
          <IconX />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  if (isPending || BOXFeePending || POSTFeePending) return <Loading />;

  let total = finalData?.reduce((total, item) => item.final + total, 0);
  total += +(BOXFee || 0);
  total += +(POSTFee || 0);

  const localInfo = JSON.parse(
    window.localStorage.getItem("localInfo") || "{}"
  );

  // فیلدهای اجباری
  const requiredFields = ['name', 'phone', 'state', 'city', 'address'];

  return (
    <div>
      <ScrollArea>
        <Table miw={700}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>نام محصول</Table.Th>
              <Table.Th>تعداد</Table.Th>
              <Table.Th>قیمت</Table.Th>
              <Table.Th>قیمت نهایی</Table.Th>
              <Table.Th>حذف</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
      {!rows?.length && (
        <div className={"h-[200px] w-full center flex-col gap-3"}>
          <h2>سبد خرید شما خالی است!</h2>
          <Link href={"/showIntro"}>
            <Button>خرید از فروشگاه</Button>
          </Link>
        </div>
      )}
      <div className={`center justify-end ${!rows?.length && "hidden"}`}>
        <Button onClick={() => _openCart()}>ویرایش سبد خرید</Button>
      </div>
      <br />
      <form
        className={`${!rows?.length && "hidden"}`}
        action={async (formData) => {
          let json = formDataToJson(formData);
          createOrderPortal(
            Object.fromEntries(
              Object.values(cart).map(({ product, quantity }) => [
                product.id,
                quantity,
              ])
            ),
            json as any
          ).then((res) => {
            alert(res.message);
            if (res.token) {
              window.localStorage.setItem("localInfo", JSON.stringify(json));
              window.localStorage.removeItem("cart");
              window.doPayment(res.token);
            }
          });
        }}
      >
        <div className={"p-2 grid sm:grid-cols-2 gap-3"}>
          {Object.entries(CheckoutFields).map(([key, name]) => (
            <TextInput
              label={name}
              name={key}
              defaultValue={
                ((user?.[key as keyof typeof user] ||
                  localInfo?.[key]) as string) || ""
              }
              required={requiredFields.includes(key)}  // ← تغییر اینجا
              placeholder={name + "..."}
            />
          ))}
        </div>
        <br />
        <div className={"center justify-between flex-wrap lg:px-10 px-2"}>
          <div>
            {POSTFee && BOXFee ? (
              <>
                <p className={"text-sm"}>
                  هزینه پست:{" "}
                  {+POSTFee === 0 ? " پس کرایه  " : (+POSTFee!).toLocaleString?.("fa")}
                  تومان
                </p>
                <p className={"text-sm mb-1"}>
                  هزینه بسته بندی: {(+BOXFee!)?.toLocaleString?.("fa")} تومان
                </p>
              </>
            ) : null}
            <p>مجموع</p>
            <h3>{total.toLocaleString("fa")} تومان</h3>
          </div>
          <Button disabled={BOXFeePending || POSTFeePending} type={"submit"}>
            پرداخت
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Page;