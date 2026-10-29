"use client";

import { useCart, removeFromCart, setLocalCart } from "@/utils/localCart";
import { useRouter } from "next/navigation";
import { useAction } from "@/utils/server";
import { getCartFees, getEmptyCartRecommendations } from "./action";
import { applyDiscountCode } from "@/app/(web)/dashboard/checkout/checkout.action";
import Loading from "@/app/(app)/loading";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  IconArrowLeft,
  IconCircleCheck,
  IconMinus,
  IconPlus,
  IconShoppingCart,
  IconTag,
  IconTrash,
  IconTruck,
  IconSparkles,
  IconPackage,
  IconCheck,
} from "@tabler/icons-react";
import styles from "./cart.module.css";
import { isFreeShipping, productShowsFreeBadge, remainingForFreeShipping } from "@/utils/freeShipping";
import { formatPersianCurrency, formatPersianNumber } from "@/utils/format";

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
  const { result: recommendations, isPending: recsPending } = useAction(getEmptyCartRecommendations);

  const boxFee = fees?.boxFee;
  const postFee = fees?.postFee;
  const freeShippingThreshold = fees?.freeShippingThreshold || 2000000;
  const cart = useCart();
  const items = Object.values(cart);

  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountApplying, setDiscountApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const productsTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
  }, [items]);

  const freeShipping = useMemo(() => {
    return isFreeShipping(items, freeShippingThreshold);
  }, [items, freeShippingThreshold]);

  const effectivePostFee = freeShipping ? 0 : Number(postFee || 0);
  const total = productsTotal + Number(boxFee || 0) + effectivePostFee;
  const payableTotal = Math.max(0, total - discountAmount);
  const remaining = remainingForFreeShipping(items, freeShippingThreshold);

  const productPayload = useMemo(() => {
    return Object.fromEntries(items.map(({ product, quantity }) => [product.id, quantity]));
  }, [items]);

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

  const handleQuickAdd = (product: any) => {
    const currentQty = cart[product.id]?.quantity || 0;
    setLocalCart(product, currentQty + 1);
    setToastMessage(`«${product.name}» به سبد اضافه شد 👌`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (feesPending) return <Loading />;

  // ==============================================================
  // 1. EMPTY CART STATE (REQUIREMENT 3: FULLY REDESIGNED)
  // ==============================================================
  if (!items.length) {
    return (
      <main className={styles.page}>
        {toastMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-black flex items-center gap-2 animate-bounce">
            <IconCheck size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className={styles.container}>
          {/* Friendly Empty Card */}
          <div className={`${styles.emptyCard} shadow-sm mb-10`}>
            <div className={styles.emptyIconCircle}>
              <IconShoppingCart size={36} />
            </div>
            <h1 className={styles.emptyTitle}>سبد خرید شما در حال حاضر خالی است</h1>
            <p className={styles.emptyDesc}>
              محصولات اصیل گیاهی، عسل طبیعی سبلان، حلوای سیاه سنتی اردبیل و سوغات ناب طِب خیّر در انتظار شما هستند.
            </p>
            <Link href="/category" className={styles.emptyCta}>
              <span>مشاهده محصولات و شروع خرید</span>
              <IconArrowLeft size={16} />
            </Link>
          </div>

          {/* Popular Categories Grid */}
          {recommendations?.popularCategories && recommendations.popularCategories.length > 0 && (
            <section className="mb-10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                  <IconPackage size={20} className="text-blue-600" />
                  <span>دسته‌بندی‌های محبوب طِب خیّر</span>
                </h2>
                <Link href="/category" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                  همه دسته‌بندی‌ها
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {recommendations.popularCategories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className="p-3 bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all text-center flex flex-col items-center justify-between group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-50 p-2 mb-2 group-hover:scale-105 transition-transform flex items-center justify-center">
                      <img
                        src={cat.thumbnail || "/backend/images/default_thumbnail.png"}
                        alt={cat.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {cat._count?.products ? `${formatPersianNumber(cat._count.products)} کالا` : "مشاهده"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Best Selling Products with 1-Click Purchase */}
          {recommendations?.bestSellingProducts && recommendations.bestSellingProducts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                  <IconSparkles size={20} className="text-amber-500" />
                  <span>پیشنهادهای پرطرفدار و پرفروش</span>
                </h2>
                <span className="text-xs text-gray-500">امکان افزودن مستقیم با یک کلیک</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {recommendations.bestSellingProducts.map((p: any) => {
                  const hasDiscount = (p.discountPercent || 0) > 0 && p.originalPrice;
                  const image = p.images?.[0] || "/empty.png";

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image & Badges */}
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2">
                          <img
                            src={image}
                            alt={p.name}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Standard non-overlapping badges */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end pointer-events-none z-10">
                            {p.isSpecial && (
                              <span className="bg-blue-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                ویژه
                              </span>
                            )}
                            {p.isBestSeller && (
                              <span className="bg-orange-500 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                پرفروش
                              </span>
                            )}
                            {p.freeShipping && (
                              <span
                                style={{ backgroundColor: "#059669", color: "#ffffff" }}
                                className="text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs"
                              >
                                ارسال رایگان
                              </span>
                            )}
                            {hasDiscount && (
                              <span className="bg-red-500 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                ٪{formatPersianNumber(Number(p.discountPercent))}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <Link
                          href={`/product/${p.id}`}
                          className="text-xs font-bold text-gray-900 hover:text-blue-600 line-clamp-2 leading-snug block mb-1"
                        >
                          {p.name}
                        </Link>
                      </div>

                      {/* Price & 1-click Add */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1 mt-2">
                        <div>
                          <div className="font-black text-xs text-gray-900">
                            {formatPersianCurrency(Number(p.price))}
                          </div>
                          {hasDiscount && (
                            <div className="text-[10px] text-gray-400 line-through">
                              {formatPersianCurrency(Number(p.originalPrice))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickAdd(p)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        >
                          <IconPlus size={13} />
                          <span>خرید</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    );
  }

  // ==============================================================
  // 2. CART WITH PRODUCTS (REQUIREMENT 3: FULLY HARMONIZED BADGES & SUMMARY)
  // ==============================================================
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Steps indicator */}
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
          {/* Left Column: Summary */}
          <aside className={`${styles.card} ${styles.summary}`}>
            <div className={styles.titleRow}>
              <IconShoppingCart className={styles.titleIcon} size={22} />
              <div>
                <h2 className={styles.title}>خلاصه سفارش</h2>
                <p className={styles.subtitle}>جمع‌بندی هزینه‌ها و تخفیف‌ها</p>
              </div>
            </div>

            {/* Dynamic Free Shipping Status Box */}
            {freeShippingThreshold > 0 && (
              <div className={freeShipping ? styles.freeShippingDone : styles.freeShippingProgress}>
                <IconTruck size={20} />
                {freeShipping ? (
                  <span>تبریک! سفارش شما شامل ارسال رایگان شد 🎁</span>
                ) : (
                  <span>فقط {remaining.toLocaleString("fa-IR")} تومان دیگر خرید کنید تا از ارسال رایگان بهره‌مند شوید.</span>
                )}
              </div>
            )}

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>جمع کل محصولات</span>
                <strong>{formatPrice(productsTotal)}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>هزینه ارسال</span>
                <strong className={freeShipping ? styles.discountValue : undefined}>
                  {freeShipping ? "رایگان" : Number(postFee) ? formatPrice(Number(postFee)) : "پس‌کرایه"}
                </strong>
              </div>
              <div className={styles.summaryRow}>
                <span>هزینه بسته‌بندی</span>
                <strong>{formatPrice(Number(boxFee || 0))}</strong>
              </div>
              {discountAmount > 0 && (
                <div className={styles.summaryRow}>
                  <span>تخفیف</span>
                  <strong className={styles.discountValue}>- {formatPrice(discountAmount)}</strong>
                </div>
              )}
              <div className={styles.payable}>
                <span>مبلغ قابل پرداخت</span>
                <strong>{formatPrice(payableTotal)}</strong>
              </div>
            </div>

            <button type="button" onClick={goToCheckout} className={styles.primary}>
              <span>ادامه و ثبت سفارش</span>
              <IconArrowLeft size={16} />
            </button>
            <p className={styles.policy}>
              با ادامه سفارش، شرایط استفاده از خدمات و حریم خصوصی طِب خیّر را می‌پذیرید.
            </p>
          </aside>

          {/* Right Column: Items list */}
          <section className={`${styles.card} ${styles.cartCard}`}>
            <div className={styles.titleRow}>
              <IconShoppingCart className={styles.titleIcon} size={22} />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h1 className={styles.title}>سبد خرید من</h1>
                  <p className={styles.subtitle}>{items.length.toLocaleString("fa-IR")} کالا در سبد شما وجود دارد</p>
                </div>
                <Link href="/category" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                  + افزودن کالای دیگر
                </Link>
              </div>
            </div>

            <div className={styles.items}>
              {items.map(({ product, quantity }) => {
                const showFree = productShowsFreeBadge({ product, quantity }, items, freeShippingThreshold);
                const hasDiscount = (product.discountPercent || 0) > 0 && product.originalPrice;

                return (
                  <div className={styles.item} key={product.id}>
                    {/* Image wrap */}
                    <div className={styles.imageWrap}>
                      <img
                        className={styles.image}
                        src={product.images?.[0] || "/empty.png"}
                        alt={product.name || "محصول"}
                      />
                    </div>

                    {/* Details and standard non-overlapping badges */}
                    <div className={styles.itemDetails}>
                      <div className={styles.name}>
                        <Link href={`/product/${product.id}`} className={styles.nameLink}>
                          {product.name}
                        </Link>
                      </div>

                      <div className={styles.meta}>
                        {product.description_text?.slice?.(0, 65) || ""}
                      </div>

                      {/* Cohesive, proportional badge row */}
                      <div className={styles.badgeRow}>
                        {product.isSpecial && (
                          <span className={`${styles.badgeItem} ${styles.badgeSpecial}`}>
                            ویژه
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className={`${styles.badgeItem} ${styles.badgeBestSeller}`}>
                            پرفروش
                          </span>
                        )}
                        {showFree && (
                          <span className={`${styles.badgeItem} ${styles.badgeFreeShipping}`}>
                            ارسال رایگان
                          </span>
                        )}
                        {hasDiscount && (
                          <span className={`${styles.badgeItem} ${styles.badgeDiscount}`}>
                            ٪{formatPersianNumber(Number(product.discountPercent))} تخفیف
                          </span>
                        )}
                      </div>

                      <div className={styles.stock}>
                        <IconCircleCheck size={13} />
                        <span>موجود در انبار</span>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className={styles.unit}>
                      <span>قیمت واحد</span>
                      <strong>{formatPrice(Number(product.price || 0))}</strong>
                    </div>

                    {/* Quantity controls */}
                    <div className={styles.quantity}>
                      <button
                        type="button"
                        onClick={() => setLocalCart(product, quantity + 1)}
                        title="افزایش تعداد"
                      >
                        <IconPlus size={14} />
                      </button>
                      <span>{quantity.toLocaleString("fa-IR")}</span>
                      <button
                        type="button"
                        onClick={() => setLocalCart(product, Math.max(1, quantity - 1))}
                        title="کاهش تعداد"
                      >
                        <IconMinus size={14} />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className={styles.lineTotal}>
                      <span>قیمت کل</span>
                      <strong>{formatPrice(Number(product.price || 0) * quantity)}</strong>
                    </div>

                    {/* Remove button */}
                    <button
                      className={styles.remove}
                      type="button"
                      onClick={() => removeFromCart(product)}
                      aria-label="حذف از سبد"
                      title="حذف از سبد"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Discount code section */}
            <div className={styles.discount}>
              <div className={styles.discountLabel}>
                <IconTag size={16} />
                <span>کد تخفیف دارید؟</span>
              </div>
              <div className={styles.discountInput}>
                <input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.currentTarget.value)}
                  placeholder="کد تخفیف را وارد کنید"
                />
                <button type="button" onClick={applyDiscount} disabled={discountApplying}>
                  {discountApplying ? "..." : "اعمال کد"}
                </button>
              </div>
              {discountMessage && <small className={styles.discountMessage}>{discountMessage}</small>}
            </div>
          </section>
        </div>
      </div>

      {/* Floating Sticky Mobile CTA Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 shadow-2xl flex items-center justify-between">
        <div>
          <span className="text-[11px] text-gray-500 block">مبلغ نهایی:</span>
          <strong className="text-sm font-black text-blue-700 font-mono">
            {formatPrice(payableTotal)}
          </strong>
        </div>

        <button
          type="button"
          onClick={goToCheckout}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
        >
          <span>ادامه و ثبت سفارش</span>
          <IconArrowLeft size={14} />
        </button>
      </div>
    </main>
  );
};

export default Page;
