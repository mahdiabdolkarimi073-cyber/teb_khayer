"use client";

import { getCart, removeFromCart, useCart } from "@/utils/localCart";
import React, { useRef, useState } from "react";
import { Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import { CheckoutFields } from "@/app/(web)/dashboard/checkout/checkout.fields";
import { formDataToJson } from "@/utils/other";
import { SettingKey } from "@prisma/client";
import { useAction } from "@/utils/server";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import Loading from "@/app/(app)/loading";
import { createOrderPortal } from "@/app/(web)/dashboard/checkout/checkout.action";
import { getVar } from "@backend/utils/setting";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCreditCard,
  IconMapPin,
  IconPackage,
  IconShieldCheck,
  IconShoppingCart,
  IconTag,
  IconTruckDelivery,
  IconWallet,
} from "@tabler/icons-react";
import styles from "./checkout.module.css";

const steps = [
  { title: "سبد خرید", detail: "بررسی محصولات", icon: IconShoppingCart },
  { title: "اطلاعات و پرداخت", detail: "تکمیل اطلاعات و پرداخت", icon: IconCreditCard },
  { title: "تایید سفارش", detail: "بررسی و ثبت نهایی", icon: IconPackage },
  { title: "سفارش تکمیل شد", detail: "تشکر از خرید شما", icon: IconShieldCheck },
];

const formatPrice = (value: number) => `${value.toLocaleString("fa-IR")} تومان`;

const Page = () => {
  const router = useRouter();
  const { result: user, isPending } = useAction(getUserFromCookie);
  const { result: boxFee, isPending: boxFeePending } = useAction(getVar, "PRODUCT_BOX_FEE" as SettingKey);
  const { result: postFee, isPending: postFeePending } = useAction(getVar, "PRODUCT_POST_FEE" as SettingKey);
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const requestIdRef = useRef<string>("");
  const items = Object.values(cart);
  const localInfo = typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("localInfo") || "{}") : {};
  const productsTotal = items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
  const total = productsTotal + Number(boxFee || 0) + Number(postFee || 0);
  const requiredFields = ["name", "phone", "state", "city", "address"];

  if (isPending || boxFeePending || postFeePending) return <Loading />;

  if (!items.length) {
    return (
      <main className={styles.page}>
        <div className={`${styles.container} ${styles.card} ${styles.empty}`}>
          <IconShoppingCart size={42} color="#0875e1" />
          <h2>سبد خرید شما خالی است</h2>
          <Link href="/category/all">بازگشت به فروشگاه</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.steps} aria-label="مراحل خرید">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div className={`${styles.step} ${index === 1 ? styles.stepActive : ""}`} key={step.title}>
                <span className={styles.stepIcon}><StepIcon size={16} /></span>
                <span className={styles.stepText}><strong>{index + 1}. {step.title}</strong><small>{step.detail}</small></span>
              </div>
            );
          })}
        </div>

        <div className={styles.content}>
          <section className={`${styles.card} ${styles.formCard}`}>
            <div className={styles.titleRow}>
              <IconMapPin className={styles.titleIcon} size={22} />
              <div><h1 className={styles.title}>اطلاعات ارسال</h1><p className={styles.subtitle}>لطفاً آدرس و مشخصات خود را وارد کنید</p></div>
            </div>

            <form action={async (formData: FormData) => {
              if (submitting) return;
              setSubmitting(true);
              if (!requestIdRef.current) requestIdRef.current = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
              const json = formDataToJson(formData);
              createOrderPortal(Object.fromEntries(items.map(({ product, quantity }) => [product.id, quantity])), json as any, requestIdRef.current)
                .then((res) => {
                  if (res.token) {
                    window.localStorage.setItem("localInfo", JSON.stringify(json));
                    window.localStorage.removeItem("cart");
                    window.doPayment(res.token);
                  } else {
                    const errMap: Record<number, string> = { 401: "لطفاً ابتدا وارد حساب خود شوید.", 400: res.message || "اطلاعات سفارش نامعتبر است.", 404: "یکی از محصولات سفارش یافت نشد.", 409: "این سفارش قبلاً ثبت شده است.", 500: "خطای سرور در ثبت سفارش." };
                    alert((res.status != null && errMap[res.status]) || res.message || "خطا در ثبت سفارش");
                  }
                })
                .catch(() => alert("ارتباط با سرور برقرار نشد. دوباره تلاش کنید."))
                .finally(() => setSubmitting(false));
            }}>
              <div className={styles.fields}>
                {Object.entries(CheckoutFields).map(([key, label]) => (
                  <div className={`${styles.field} ${key === "address" ? styles.fieldFull : ""}`} key={key}>
                    <label htmlFor={key}>{label} {requiredFields.includes(key) && <span>*</span>}</label>
                    <input id={key} name={key} required={requiredFields.includes(key)} defaultValue={String(user?.[key as keyof typeof user] || localInfo?.[key] || "")} placeholder={label} />
                  </div>
                ))}
              </div>

              <div className={styles.section}>
                <div className={styles.titleRow}><IconCreditCard className={styles.titleIcon} size={22} /><div><h2 className={styles.title}>روش پرداخت</h2><p className={styles.subtitle}>لطفاً روش پرداخت مورد نظر خود را انتخاب کنید</p></div></div>
                <div className={styles.paymentOptions}>
                  <label className={`${styles.paymentOption} ${styles.paymentOptionActive}`}><input type="radio" name="paymentMethod" defaultChecked /><IconCreditCard className={styles.paymentIcon} size={22} /><span className={styles.paymentOptionText}>پرداخت آنلاین<small>با کارت بانکی</small></span></label>
                  <label className={styles.paymentOption}><input type="radio" name="paymentMethod" /><IconTruckDelivery className={styles.paymentIcon} size={22} /><span className={styles.paymentOptionText}>پرداخت در محل<small>پرداخت هنگام تحویل</small></span></label>
                  <label className={styles.paymentOption}><input type="radio" name="paymentMethod" /><IconWallet className={styles.paymentIcon} size={22} /><span className={styles.paymentOptionText}>کیف پول تبریز<small>با موجودی حساب</small></span></label>
                </div>
              </div>

              <div className={styles.notice}><IconShieldCheck size={17} />پرداخت شما کاملاً امن و مطابق با استانداردهای بانکی انجام می‌شود.</div>
              <div className={styles.actions}><Link href="/dashboard/cart" className={styles.backLink}><IconArrowLeft size={15} />بازگشت به سبد خرید</Link><button className={styles.submit} type="submit" disabled={submitting}>{submitting ? <span><Loader size="xs" color="white" /> در حال پردازش...</span> : "ثبت و پرداخت نهایی"}</button></div>
            </form>
          </section>

          <aside className={`${styles.card} ${styles.summaryCard}`}>
            <div className={styles.titleRow}><IconShoppingCart className={styles.titleIcon} size={22} /><h2 className={styles.title}>خلاصه سفارش</h2></div>
            <div className={styles.summaryItems}>
              {items.map(({ product, quantity }) => <div className={styles.item} key={product.id}><img className={styles.itemImage} src={product.images?.[0] || "/empty.png"} alt={product.name || "محصول"} /><div><div className={styles.itemName}>{product.name}</div><div className={styles.itemMeta}>تعداد: {quantity} عدد</div></div><div className={styles.itemPrice}>{formatPrice(Number(product.price || 0) * quantity)}<small>واحد: {formatPrice(Number(product.price || 0))}</small><button type="button" onClick={() => { removeFromCart(product); router.refresh(); }} aria-label="حذف محصول">حذف</button></div></div>)}
            </div>
            <div className={styles.discount}><div className={styles.discountTitle}><IconTag size={16} />کد تخفیف دارید؟</div><div className={styles.discountRow}><input placeholder="کد تخفیف را وارد کنید" /><button type="button">اعمال</button></div></div>
            <div className={styles.totals}><div className={styles.totalRow}><span>جمع کل محصولات</span><strong>{formatPrice(productsTotal)}</strong></div><div className={styles.totalRow}><span>هزینه ارسال</span><strong>{Number(postFee) ? formatPrice(Number(postFee)) : "پس‌کرایه"}</strong></div><div className={styles.totalRow}><span>هزینه بسته‌بندی</span><strong>{formatPrice(Number(boxFee || 0))}</strong></div><div className={styles.finalTotal}><span>مبلغ قابل پرداخت</span><strong>{formatPrice(total)}</strong></div></div>
            <div className={styles.security}><IconShieldCheck size={17} />خرید شما با ضمانت بازگشت ۷ روزه انجام می‌شود.</div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Page;
