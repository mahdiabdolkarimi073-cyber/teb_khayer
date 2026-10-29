"use client";

import { removeFromCart, useCart } from "@/utils/localCart";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader } from "@mantine/core";
import { useRouter } from "next/navigation";
import { CheckoutFields } from "@/app/(web)/dashboard/checkout/checkout.fields";
import { formDataToJson } from "@/utils/other";
import { useAction } from "@/utils/server";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import Loading from "@/app/(app)/loading";
import { applyDiscountCode, createOrderPortal } from "@/app/(web)/dashboard/checkout/checkout.action";
import { getCheckoutFees } from "@/app/(web)/dashboard/checkout/fees.action";
import { getAddresses } from "@/app/(web)/dashboard/addresses/action";
import { isFreeShipping, productShowsFreeBadge } from "@/utils/freeShipping";
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
  IconHome,
  IconBriefcase,
  IconPlus,
  IconClock,
  IconSparkles,
  IconCash,
} from "@tabler/icons-react";
import styles from "./checkout.module.css";

const steps = [
  { title: "سبد خرید", detail: "بررسی محصولات", icon: IconShoppingCart },
  { title: "اطلاعات و پرداخت", detail: "تکمیل اطلاعات و پرداخت", icon: IconCreditCard },
  { title: "تایید سفارش", detail: "بررسی و ثبت نهایی", icon: IconPackage },
  { title: "سفارش تکمیل شد", detail: "تشکر از خرید شما", icon: IconShieldCheck },
];

const formatPrice = (value: number) => `${Math.round(value).toLocaleString("fa-IR")} تومان`;

const Page = () => {
  const router = useRouter();
  const cart = useCart();
  const items = Object.values(cart);
  const productIds = useMemo(() => items.map((i) => i.product.id), [items]);

  const { result: user, isPending } = useAction(getUserFromCookie);
  const { result: fees, isPending: feesPending } = useAction(getCheckoutFees, productIds);
  const { result: savedAddresses } = useAction(getAddresses);

  const boxFee = Number(fees?.boxFee || 0);
  const postFee = Number(fees?.postFee || 36000);
  const cashOnDeliveryEnabled = fees?.cashOnDeliveryEnabled === true;
  const freeShippingThreshold = fees?.freeShippingThreshold || 2000000;
  const deliveryEstimatedDays = fees?.deliveryEstimatedDays || "۳ تا ۵ روز کاری";
  const unifiedShipping = fees?.unifiedShipping;
  const productShippingConfigs = fees?.productShippingConfigs || {};

  const [submitting, setSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountApplying, setDiscountApplying] = useState(false);
  const [shippingPaymentMethod, setShippingPaymentMethod] = useState<"online" | "postpaid">("online");
  const requestIdRef = useRef<string>("");
  const [prefilledDiscount, setPrefilledDiscount] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const productPayload = Object.fromEntries(items.map(({ product, quantity }) => [product.id, quantity]));
  const localInfo = typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("localInfo") || "{}") : {};
  const productsTotal = items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);

  // Free shipping check
  const freeShipping = isFreeShipping(items, freeShippingThreshold);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - productsTotal);
  const freeShippingProgress = Math.min(100, Math.round((productsTotal / freeShippingThreshold) * 100));

  // Base shipping fee computation following hierarchy
  const { baseShippingFee, originalShippingFee, shippingDiscount, shippingMethodType } = useMemo(() => {
    if (freeShipping) {
      return {
        baseShippingFee: 0,
        originalShippingFee: 0,
        shippingDiscount: 0,
        shippingMethodType: "FREE_SHIPPING",
      };
    }
    if (unifiedShipping?.enabled) {
      const orig = unifiedShipping.fee || 39000;
      const disc = unifiedShipping.discount || 0;
      return {
        baseShippingFee: Math.max(0, orig - disc),
        originalShippingFee: orig,
        shippingDiscount: disc,
        shippingMethodType: "UNIFIED",
      };
    }
    // Check per-product shipping configs
    const customItems = items.filter((it) => productShippingConfigs[it.product.id]?.hasCustomShipping);
    if (customItems.length > 0) {
      const feesArr = items.map((it) => {
        const cfg = productShippingConfigs[it.product.id];
        if (cfg && cfg.hasCustomShipping) {
          return Math.max(0, cfg.shippingFee - cfg.shippingDiscount);
        }
        return postFee;
      });
      const origArr = items.map((it) => {
        const cfg = productShippingConfigs[it.product.id];
        if (cfg && cfg.hasCustomShipping) {
          return cfg.shippingFee;
        }
        return postFee;
      });
      const maxFee = Math.max(...feesArr);
      const maxOrig = Math.max(...origArr);
      return {
        baseShippingFee: maxFee,
        originalShippingFee: maxOrig,
        shippingDiscount: Math.max(0, maxOrig - maxFee),
        shippingMethodType: "PRODUCT_CUSTOM",
      };
    }
    return {
      baseShippingFee: postFee,
      originalShippingFee: postFee,
      shippingDiscount: 0,
      shippingMethodType: "DEFAULT_POST",
    };
  }, [freeShipping, unifiedShipping, productShippingConfigs, items, postFee]);

  const onlinePayableShipping = freeShipping || shippingPaymentMethod === "postpaid" ? 0 : baseShippingFee;
  const postpaidShipping = !freeShipping && shippingPaymentMethod === "postpaid" ? baseShippingFee : 0;

  const total = productsTotal + boxFee + onlinePayableShipping;
  const payableTotal = Math.max(0, total - discountAmount);

  const saveCurrentForm = () => {
    if (typeof window === "undefined") return;
    const currentData: Record<string, any> = { ...localInfo };
    Object.keys(CheckoutFields).forEach((key) => {
      const el = document.getElementById(key) as HTMLInputElement | null;
      if (el) currentData[key] = el.value;
    });
    currentData.shippingPaymentMethod = shippingPaymentMethod;
    window.localStorage.setItem("localInfo", JSON.stringify(currentData));
  };

  const handleBuyWithFreeShipping = () => {
    saveCurrentForm();
    router.push("/category?fromCheckout=true");
  };

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

  const requiredFields = ["name", "phone", "state", "city", "address"];

  useEffect(() => {
    if (prefilledDiscount || feesPending || !items.length) return;
    const savedCode = typeof window !== "undefined" ? window.localStorage.getItem("appliedDiscountCode") : null;
    if (savedCode && savedCode.trim()) {
      setPrefilledDiscount(true);
      setDiscountCode(savedCode);
      setDiscountApplying(true);
      applyDiscountCode(savedCode, productPayload)
        .then((result) => {
          setDiscountAmount(result.amount);
          setDiscountMessage(result.message);
        })
        .catch(() => {
          setDiscountAmount(0);
          setDiscountMessage("بررسی کد تخفیف انجام نشد");
        })
        .finally(() => setDiscountApplying(false));
    } else {
      setPrefilledDiscount(true);
    }
  }, [prefilledDiscount, feesPending, items.length]);

  useEffect(() => {
    if (selectedAddressId || !savedAddresses?.length) return;
    const def = (savedAddresses as any[]).find((a) => a.isDefault);
    if (def) setSelectedAddressId(def.id);
  }, [savedAddresses, selectedAddressId]);

  useEffect(() => {
    if (!selectedAddressId || !savedAddresses?.length) return;
    const addr = (savedAddresses as any[]).find((a) => a.id === selectedAddressId);
    if (!addr) return;
    const setVal = (id: string, val: string) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.value = val;
    };
    setVal("name", addr.name || "");
    setVal("phone", addr.phone || "");
    setVal("state", addr.state || "");
    setVal("city", addr.city || "");
    setVal("address", addr.address || "");
    setVal("zipcode", addr.zipcode || "");
  }, [selectedAddressId, savedAddresses]);

  if (isPending || feesPending) return <Loading />;

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
                <span className={styles.stepIcon}>
                  <StepIcon size={16} />
                </span>
                <span className={styles.stepText}>
                  <strong>
                    {index + 1}. {step.title}
                  </strong>
                  <small>{step.detail}</small>
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.content}>
          <section className={`${styles.card} ${styles.formCard}`}>
            <div className={styles.titleRow}>
              <IconMapPin className={styles.titleIcon} size={22} />
              <div>
                <h1 className={styles.title}>اطلاعات ارسال</h1>
                <p className={styles.subtitle}>لطفاً آدرس و مشخصات تحویل‌گیرنده را وارد کنید</p>
              </div>
            </div>

            {savedAddresses && (savedAddresses as any[]).length > 0 && (
              <div className={styles.savedAddresses}>
                <div className={styles.savedAddressesTitle}>
                  <IconMapPin size={16} />
                  انتخاب از آدرس‌های ذخیره شده
                </div>
                <div className={styles.savedAddressesList}>
                  {(savedAddresses as any[]).map((addr) => (
                    <label key={addr.id} className={styles.savedAddressCard}>
                      <input
                        type="radio"
                        name="savedAddress"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div className={styles.savedAddressCardHead}>
                        <div className={styles.savedAddressCardTitle}>
                          {addr.title === "محل کار" ? <IconBriefcase size={14} /> : <IconHome size={14} />}
                          {addr.title}
                        </div>
                        {addr.isDefault && <span className={styles.savedAddressCardBadge}>پیش‌فرض</span>}
                      </div>
                      <div className={styles.savedAddressCardBody}>
                        <strong>{addr.name}</strong>
                        <div>{addr.phone}</div>
                        <div>
                          {addr.state} - {addr.city}
                        </div>
                        <div>{addr.address}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <Link href="/dashboard/addresses" className={styles.savedAddressNewBtn}>
                  <IconPlus size={14} />
                  افزودن آدرس جدید
                </Link>
              </div>
            )}

            <form
              action={async (formData: FormData) => {
                if (submitting) return;
                setSubmitting(true);
                if (!requestIdRef.current) {
                  requestIdRef.current = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
                }
                const json = formDataToJson(formData);
                // Ensure shippingPaymentMethod is passed
                json.shippingPaymentMethod = shippingPaymentMethod;

                createOrderPortal(productPayload, json as any, requestIdRef.current)
                  .then((res) => {
                    if (res.orderCompleted) {
                      window.localStorage.setItem("localInfo", JSON.stringify(json));
                      window.localStorage.removeItem("cart");
                      router.push(res.redirect || "/dashboard/orders?status=current");
                    } else if (res.token) {
                      window.localStorage.setItem("localInfo", JSON.stringify(json));
                      window.localStorage.removeItem("cart");
                      window.doPayment(res.token);
                    } else {
                      const errMap: Record<number, string> = {
                        401: "لطفاً ابتدا وارد حساب خود شوید.",
                        400: res.message || "اطلاعات سفارش نامعتبر است.",
                        404: "یکی از محصولات سفارش یافت نشد.",
                        409: "این سفارش قبلاً ثبت شده است.",
                        500: "خطای سرور در ثبت سفارش.",
                      };
                      alert((res.status != null && errMap[res.status]) || res.message || "خطا در ثبت سفارش");
                    }
                  })
                  .catch(() => alert("ارتباط با سرور برقرار نشد. دوباره تلاش کنید."))
                  .finally(() => setSubmitting(false));
              }}
            >
              <div className={styles.fields}>
                {Object.entries(CheckoutFields).map(([key, label]) => (
                  <div className={`${styles.field} ${key === "address" ? styles.fieldFull : ""}`} key={key}>
                    <label htmlFor={key}>
                      {label} {requiredFields.includes(key) && <span>*</span>}
                    </label>
                    <input
                      id={key}
                      name={key}
                      required={requiredFields.includes(key)}
                      defaultValue={String(user?.[key as keyof typeof user] || localInfo?.[key] || "")}
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>

              {/* انتخاب روش پرداخت هزینه ارسال (آنلاین یا پس‌کرایه) */}
              <div className={styles.shippingMethodSection}>
                <div className={styles.titleRow}>
                  <IconTruckDelivery className={styles.titleIcon} size={22} />
                  <div>
                    <h2 className={styles.title}>روش پرداخت هزینه ارسال</h2>
                    <p className={styles.subtitle}>
                      {freeShipping
                        ? "سفارش شما شامل ارسال کاملاً رایگان است."
                        : "میتوانید هزینه ارسال را آنلاین یا در مقصد پرداخت کنید"}
                    </p>
                  </div>
                </div>

                {freeShipping ? (
                  <div className="flex items-center gap-2 p-3 mt-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold">
                    <IconSparkles size={18} className="text-emerald-600" />
                    <span>تبریک! هزینه ارسال این سفارش کاملاً رایگان است.</span>
                  </div>
                ) : (
                  <div className={styles.shippingOptions}>
                    <label className={styles.shippingOption}>
                      <input
                        type="radio"
                        name="shippingPaymentMethodRadio"
                        value="online"
                        checked={shippingPaymentMethod === "online"}
                        onChange={() => setShippingPaymentMethod("online")}
                      />
                      <IconCreditCard className={styles.paymentIcon} size={22} />
                      <span className={styles.paymentOptionText}>
                        هزینه ارسال پستی را واریز می‌کنم
                        <small>پرداخت آنلاین همراه با فاکتور ({formatPrice(baseShippingFee)})</small>
                      </span>
                    </label>

                    <label className={styles.shippingOption}>
                      <input
                        type="radio"
                        name="shippingPaymentMethodRadio"
                        value="postpaid"
                        checked={shippingPaymentMethod === "postpaid"}
                        onChange={() => setShippingPaymentMethod("postpaid")}
                      />
                      <IconCash className={styles.paymentIcon} size={22} />
                      <span className={styles.paymentOptionText}>
                        هزینه ارسال پس‌کرایه باشد
                        <small>پرداخت در مقصد هنگام تحویل توسط مامور پست</small>
                      </span>
                    </label>
                  </div>
                )}

                <input type="hidden" name="shippingPaymentMethod" value={shippingPaymentMethod} />

                {/* نمایش زمان تقریبی ارسال سفارش */}
                <div className={styles.deliveryEstimateRow}>
                  <IconClock size={16} className="text-blue-600 shrink-0" />
                  <span>زمان تقریبی ارسال سفارش: <strong>{deliveryEstimatedDays}</strong></span>
                </div>
              </div>

              {/* روش پرداخت وجه سفارش */}
              <div className={styles.section}>
                <div className={styles.titleRow}>
                  <IconCreditCard className={styles.titleIcon} size={22} />
                  <div>
                    <h2 className={styles.title}>روش پرداخت سفارش</h2>
                    <p className={styles.subtitle}>لطفاً روش پرداخت وجه سفارش را انتخاب کنید</p>
                  </div>
                </div>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input type="radio" name="paymentMethod" value="online" defaultChecked />
                    <IconCreditCard className={styles.paymentIcon} size={22} />
                    <span className={styles.paymentOptionText}>
                      پرداخت آنلاین شتابی
                      <small>با کلیه کارت‌های بانکی عضو شتاب</small>
                    </span>
                  </label>
                  {cashOnDeliveryEnabled && (
                    <label className={styles.paymentOption}>
                      <input type="radio" name="paymentMethod" value="cashOnDelivery" />
                      <IconTruckDelivery className={styles.paymentIcon} size={22} />
                      <span className={styles.paymentOptionText}>
                        پرداخت در محل
                        <small>پرداخت نقدی هنگام تحویل کالا</small>
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <input type="hidden" name="discountCode" value={discountCode} />
              <div className={styles.notice}>
                <IconShieldCheck size={17} />
                {cashOnDeliveryEnabled
                  ? "پرداخت آنلاین شما کاملاً امن است و پرداخت در محل هنگام تحویل انجام می‌شود."
                  : "پرداخت شما از طریق درگاه‌های معتبر بانکی و با بالاترین سطح امنیت انجام می‌شود."}
              </div>
              <div className={styles.actions}>
                <Link href="/dashboard/cart" className={styles.backLink}>
                  <IconArrowLeft size={15} />
                  بازگشت به سبد خرید
                </Link>
                <button className={styles.submit} type="submit" disabled={submitting}>
                  {submitting ? (
                    <span>
                      <Loader size="xs" color="white" /> در حال پردازش...
                    </span>
                  ) : (
                    "ثبت و پرداخت نهایی"
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className={`${styles.card} ${styles.summaryCard}`}>
            <div className={styles.titleRow}>
              <IconShoppingCart className={styles.titleIcon} size={22} />
              <h2 className={styles.title}>خلاصه سفارش</h2>
            </div>

            {/* بنر و دکمه: با ارسال رایگان بخرید */}
            {!freeShipping && freeShippingThreshold > 0 && (
              <div className={styles.freeShippingCta}>
                <div className={styles.freeShippingCtaHead}>
                  <span className={styles.freeShippingCtaTitle}>
                    <IconSparkles size={16} />
                    با ارسال رایگان بخرید 😍
                  </span>
                  <button
                    type="button"
                    onClick={handleBuyWithFreeShipping}
                    className={styles.freeShippingCtaBtn}
                    title="تکمیل سبد و دریافت ارسال رایگان"
                  >
                    تکمیل خرید 🛒
                  </button>
                </div>
                <div className={styles.freeShippingCtaProgress}>
                  <div
                    className={styles.freeShippingCtaBar}
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                <span className={styles.freeShippingCtaText}>
                  تنها <strong>{remainingForFreeShipping.toLocaleString("fa-IR")} تومان</strong> دیگر به سبد خرید اضافه کنید تا ارسال سفارش شما کاملاً <strong>رایگان</strong> شود!
                </span>
              </div>
            )}

            <div className={styles.summaryItems}>
              {items.map(({ product, quantity }) => {
                const showFree = productShowsFreeBadge({ product, quantity }, items, freeShippingThreshold);
                return (
                  <div className={styles.item} key={product.id}>
                    <img
                      className={styles.itemImage}
                      src={product.images?.[0] || "/empty.png"}
                      alt={product.name || "محصول"}
                    />
                    <div>
                      <div className={styles.itemName}>{product.name}</div>
                      <div className={styles.itemMeta}>تعداد: {quantity} عدد</div>
                      {showFree && <span className={styles.itemFreeBadge}>ارسال رایگان</span>}
                    </div>
                    <div className={styles.itemPrice}>
                      {formatPrice(Number(product.price || 0) * quantity)}
                      <small>واحد: {formatPrice(Number(product.price || 0))}</small>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(product);
                          router.refresh();
                        }}
                        aria-label="حذف محصول"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.discount}>
              <div className={styles.discountTitle}>
                <IconTag size={16} />
                کد تخفیف دارید؟
              </div>
              <div className={styles.discountRow}>
                <input
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.currentTarget.value)}
                  placeholder="کد تخفیف را وارد کنید"
                />
                <button type="button" onClick={applyDiscount} disabled={discountApplying}>
                  {discountApplying ? "..." : "اعمال"}
                </button>
              </div>
              {discountMessage && <small>{discountMessage}</small>}
            </div>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>جمع کل محصولات</span>
                <strong>{formatPrice(productsTotal)}</strong>
              </div>

              {/* روش و هزینه ارسال */}
              <div className={styles.totalRow}>
                <span>هزینه ارسال</span>
                {freeShipping ? (
                  <strong className="text-emerald-600 font-bold">رایگان</strong>
                ) : shippingPaymentMethod === "postpaid" ? (
                  <div className="text-left">
                    <strong className="text-blue-600 font-bold">پس‌کرایه در مقصد</strong>
                    <small className="block text-gray-500 text-[10px]">
                      مبلغ تقریبی: {formatPrice(baseShippingFee)}
                    </small>
                  </div>
                ) : shippingDiscount > 0 ? (
                  <div className="text-left">
                    <span className="line-through text-gray-400 text-xs ml-1">
                      {formatPrice(originalShippingFee)}
                    </span>
                    <strong className="text-emerald-700">{formatPrice(baseShippingFee)}</strong>
                  </div>
                ) : (
                  <strong>{formatPrice(baseShippingFee)}</strong>
                )}
              </div>

              <div className={styles.totalRow}>
                <span>هزینه بسته‌بندی</span>
                <strong>{formatPrice(boxFee)}</strong>
              </div>

              {discountAmount > 0 && (
                <div className={styles.totalRow}>
                  <span>تخفیف</span>
                  <strong className={styles.discountValue}>- {formatPrice(discountAmount)}</strong>
                </div>
              )}

              <div className={styles.finalTotal}>
                <span>مبلغ قابل پرداخت آنلاین</span>
                <strong>{formatPrice(payableTotal)}</strong>
              </div>

              <div className="text-xs text-gray-600 border-t pt-2 mt-1">
                <span>زمان تقریبی ارسال سفارش: </span>
                <strong className="text-gray-900">{deliveryEstimatedDays}</strong>
              </div>
            </div>

            <div className={styles.security}>
              <IconShieldCheck size={17} />
              خرید شما با ضمانت اصالت طِب خیّر و ۷ روز مهلت بازگشت کالا انجام می‌شود.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Page;
