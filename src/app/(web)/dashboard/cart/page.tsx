"use client";

import { useCart, removeFromCart, setLocalCart } from "@/utils/localCart";
import { useRouter } from "next/navigation";
import { SettingKey } from "@prisma/client";
import { useAction } from "@/utils/server";
import { getVar } from "@backend/utils/setting";
import Loading from "@/app/(app)/loading";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCircleCheck,
  IconMinus,
  IconPlus,
  IconShoppingCart,
  IconTag,
  IconTrash,
  IconTruck,
} from "@tabler/icons-react";
import styles from "./cart.module.css";

const steps = [
  { title: "سبد خرید", detail: "بررسی محصولات", icon: IconShoppingCart },
  { title: "اطلاعات و پرداخت", detail: "تکمیل اطلاعات و پرداخت", icon: IconArrowLeft },
  { title: "تایید سفارش", detail: "بررسی و ثبت نهایی", icon: IconCircleCheck },
  { title: "سفارش تکمیل شد", detail: "تشکر از خرید شما", icon: IconTruck },
];

const formatPrice = (value: number) => `${value.toLocaleString("fa-IR")} تومان`;

const Page = () => {
  const router = useRouter();
  const { result: boxFee, isPending: boxFeePending } = useAction(getVar, "PRODUCT_BOX_FEE" as SettingKey);
  const { result: postFee, isPending: postFeePending } = useAction(getVar, "PRODUCT_POST_FEE" as SettingKey);
  const cart = useCart();
  const items = Object.values(cart);
  const productsTotal = items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
  const total = productsTotal + Number(boxFee || 0) + Number(postFee || 0);

  if (boxFeePending || postFeePending) return <Loading />;

  if (!items.length) {
    return (
      <main className={styles.page}>
        <div className={`${styles.container} ${styles.card} ${styles.empty}`}>
          <IconShoppingCart size={46} color="#0877e5" />
          <h1>سبد خرید شما خالی است</h1>
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
              <div className={`${styles.step} ${index === 0 ? styles.stepActive : ""}`} key={step.title}>
                <span className={styles.stepIcon}><StepIcon size={16} /></span>
                <span className={styles.stepText}><strong>{index + 1}. {step.title}</strong><small>{step.detail}</small></span>
              </div>
            );
          })}
        </div>

        <div className={styles.content}>
          <aside className={`${styles.card} ${styles.summary}`}>
            <div className={styles.titleRow}>
              <IconShoppingCart className={styles.titleIcon} size={22} />
              <div><h2 className={styles.title}>خلاصه سفارش</h2><p className={styles.subtitle}>جمع‌بندی هزینه‌ها و تخفیف‌ها</p></div>
            </div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>جمع کل محصولات</span><strong>{formatPrice(productsTotal)}</strong></div>
              <div className={styles.summaryRow}><span>هزینه ارسال</span><strong>{Number(postFee) ? formatPrice(Number(postFee)) : "پس‌کرایه"}</strong></div>
              <div className={styles.summaryRow}><span>هزینه بسته‌بندی</span><strong>{formatPrice(Number(boxFee || 0))}</strong></div>
              <div className={styles.summaryRow}><span>تخفیف</span><strong className={styles.discountValue}>۰ تومان</strong></div>
              <div className={styles.payable}><span>مبلغ قابل پرداخت</span><strong>{formatPrice(total)}</strong></div>
            </div>
            <Link href="/dashboard/checkout" className={styles.primary}>ادامه و ثبت سفارش<IconArrowLeft size={16} /></Link>
            <p className={styles.policy}>با ادامه سفارش، شرایط استفاده از خدمات و حریم خصوصی طب خیر را می‌پذیرید.</p>
          </aside>

          <section className={`${styles.card} ${styles.cartCard}`}>
            <div className={styles.titleRow}>
              <IconShoppingCart className={styles.titleIcon} size={22} />
              <div><h1 className={styles.title}>سبد خرید من</h1><p className={styles.subtitle}>{items.length.toLocaleString("fa-IR")} کالا در سبد شما وجود دارد</p></div>
            </div>
            <div className={styles.items}>
              {items.map(({ product, quantity }) => (
                <div className={styles.item} key={product.id}>
                  <img className={styles.image} src={product.images?.[0] || "/empty.png"} alt={product.name || "محصول"} />
                  <div>
                    <div className={styles.name}>{product.name}</div>
                    <div className={styles.meta}>{product.description_text?.slice?.(0, 70) || ""}</div>
                    <div className={styles.stock}><IconCircleCheck size={12} />موجود در انبار</div>
                  </div>
                  <div className={styles.unit}>قیمت واحد<strong>{formatPrice(Number(product.price || 0))}</strong></div>
                  <div className={styles.quantity}>
                    <button type="button" onClick={() => setLocalCart(product, Math.max(1, quantity - 1))}><IconMinus size={14} /></button>
                    <span>{quantity.toLocaleString("fa-IR")}</span>
                    <button type="button" onClick={() => setLocalCart(product, quantity + 1)}><IconPlus size={14} /></button>
                  </div>
                  <div className={styles.lineTotal}>قیمت کل<strong>{formatPrice(Number(product.price || 0) * quantity)}</strong></div>
                  <button className={styles.remove} type="button" onClick={() => removeFromCart(product)} aria-label="حذف"><IconTrash size={15} /></button>
                </div>
              ))}
            </div>
            <div className={styles.discount}>
              <div className={styles.discountLabel}><IconTag size={16} />کد تخفیف دارید؟</div>
              <div className={styles.discountInput}><input placeholder="کد تخفیف را وارد کنید" /><button type="button">اعمال کد تخفیف</button></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Page;
