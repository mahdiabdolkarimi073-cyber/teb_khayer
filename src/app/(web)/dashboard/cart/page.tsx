"use client";

import { useCart, removeFromCart, setLocalCart } from "@/utils/localCart";
import { useRouter } from "next/navigation";
import { useAction } from "@/utils/server";
import { getCartFees } from "./action";
import { applyDiscountCode } from "@/app/(web)/dashboard/checkout/checkout.action";
import Loading from "@/app/(app)/loading";
import Link from "next/link";
import { useState } from "react";
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
  const { result: fees, isPending: feesPending } = useAction(getCartFees);
  const boxFee = fees?.boxFee;
  const postFee = fees?.postFee;
  const cart = useCart();
  const items = Object.values(cart);

  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountApplying, setDiscountApplying] = useState(false);

  const productsTotal = items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
  const total = productsTotal + Number(boxFee || 0) + Number(postFee || 0);
  const payableTotal = Math.max(0, total - discountAmount);

  const productPayload = Object.fromEntries(items.map(({ product, quantity }) => [product.id, quantity]));

  const applyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountAmount(0);
      setDiscountMessage("کد تخفیف را وارد کنید");
      return;
    }
    setDiscountApplying(true);
    applyDiscountCode(discountCode, productPayload)
      .then((result) => {
        setDiscountAmount(result.amount);
        setDiscountMessage(result.message);
      })
      .catch(() => {
        setDiscountAmount(0);
        setDiscountMessage("بررسی کد تخفیف انجام نشد");
      })
      .finally(() => setDiscountApplying(false));
  };

  const goToCheckout = () => {
    if (discountCode.trim() && discountAmount > 0) {
      window.localStorage.setItem("appliedDiscountCode", discountCode.trim());
    } else {
      window.localStorage.removeItem("appliedDiscountCode");
    }
    router.push("/dashboard/checkout");
  };

  if (feesPending) return <Loading />;

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
              {discountAmount > 0 && <div className={styles.summaryRow}><span>تخفیف</span><strong className={styles.discountValue}>- {formatPrice(discountAmount)}</strong></div>}
              <div className={styles.payable}><span>مبلغ قابل پرداخت</span><strong>{formatPrice(payableTotal)}</strong></div>
            </div>
            <button type="button" onClick={goToCheckout} className={styles.primary}>ادامه و ثبت سفارش<IconArrowLeft size={16} /></button>
            <p className={styles.policy}>با ادامه سفارش، شرایط استفاده از خدمات و حریم خصوصی طِب خیّر را می‌پذیرید.</p>
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
              <div className={styles.discountInput}>
                <input value={discountCode} onChange={(e) => setDiscountCode(e.currentTarget.value)} placeholder="کد تخفیف را وارد کنید" />
                <button type="button" onClick={applyDiscount} disabled={discountApplying}>{discountApplying ? "..." : "اعمال کد تخفیف"}</button>
              </div>
              {discountMessage && <small className={styles.discountMessage}>{discountMessage}</small>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Page;
