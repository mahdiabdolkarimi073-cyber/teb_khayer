"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  IconCheck,
  IconShoppingCart,
  IconTruck,
  IconSparkles,
  IconArrowLeft,
  IconPlus,
  IconMinus,
  IconHeart,
  IconPackage,
  IconChevronLeft,
} from "@tabler/icons-react";
import { Product, ProductCategory } from "@prisma/client";
import { useCart, setLocalCart, removeFromCart } from "@/utils/localCart";
import { formatPersianCurrency, formatPersianNumber } from "@/utils/format";
import { isFreeShipping, remainingForFreeShipping } from "@/utils/freeShipping";

interface CategoryWithCount extends ProductCategory {
  _count?: { products: number };
}

interface CategorySelectionViewProps {
  categories: CategoryWithCount[];
  complementaryProducts: (Product & { category?: ProductCategory | null })[];
  freeShippingThreshold: number;
  recentlyAddedProduct?: Product | null;
}

export function CategorySelectionView({
  categories,
  complementaryProducts,
  freeShippingThreshold,
  recentlyAddedProduct,
}: CategorySelectionViewProps) {
  const searchParams = useSearchParams();
  const fromCheckout = searchParams.get("fromCheckout") === "true";
  const isAddedMode = searchParams.get("added") === "true" || !!recentlyAddedProduct;
  const cart = useCart();
  const cartItems = Object.values(cart);

  // Cart financial calculations
  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const qualifiesFreeShipping = useMemo(() => {
    return isFreeShipping(cartItems, freeShippingThreshold);
  }, [cartItems, freeShippingThreshold]);

  const remaining = useMemo(() => {
    return remainingForFreeShipping(cartItems, freeShippingThreshold);
  }, [cartItems, freeShippingThreshold]);

  const progressPercent = useMemo(() => {
    if (qualifiesFreeShipping) return 100;
    if (freeShippingThreshold <= 0) return 100;
    return Math.min(Math.round((cartTotal / freeShippingThreshold) * 100), 100);
  }, [cartTotal, freeShippingThreshold, qualifiesFreeShipping]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddProduct = (product: Product) => {
    const currentQty = cart[product.id]?.quantity || 0;
    const nextQty = currentQty + 1;
    setLocalCart(product, nextQty);
    setToastMessage(`«${product.name}» به سبد خرید اضافه شد 👌`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDecreaseProduct = (product: Product) => {
    const currentQty = cart[product.id]?.quantity || 0;
    if (currentQty <= 1) {
      removeFromCart(product);
    } else {
      setLocalCart(product, currentQty - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-[#173b68] pb-24" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-black flex items-center gap-2 animate-bounce">
          <IconCheck size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-gray-200/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-semibold">
          <Link href="/" className="hover:text-blue-600">خانه</Link>
          <IconChevronLeft size={14} className="text-gray-400" />
          <span className="text-gray-900 font-bold">دسته‌بندی‌های محصولات</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* ============================================================== */}
        {/* 1. HERO BANNER: KALA EZAFE SHOD & FREE SHIPPING INCENTIVE     */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-l from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-900/15">
          <div className="relative z-10 space-y-4">
            {/* Added pill badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-black border border-white/20">
                <span>👌</span>
                <span>کالا اضافه شد</span>
                {recentlyAddedProduct && (
                  <span className="opacity-90 font-normal">({recentlyAddedProduct.name})</span>
                )}
              </div>

              {/* Direct Go to Cart & Checkout Buttons */}
              <div className="flex items-center gap-2">
                {fromCheckout && (
                  <Link
                    href="/dashboard/checkout"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>بازگشت به تسویه و پرداخت 💳</span>
                  </Link>
                )}
                <Link
                  href="/dashboard/cart"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-amber-900/20 transition-all transform hover:-translate-y-0.5"
                >
                  <IconShoppingCart size={18} />
                  <span>برو به سبد خرید 🛒</span>
                  {cartCount > 0 && (
                    <span className="bg-gray-900 text-amber-300 px-2 py-0.5 rounded-full text-xs font-mono">
                      {formatPersianNumber(cartCount)}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Motivational headline */}
            <div className="space-y-1">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>خریدت رو کامل‌تر کن تا رایگان ارسال بشه برات 😍</span>
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                با افزودن محصولات مکمل و سوغات اصیل اردبیل مانند عسل سبلان و حلوای سیاه، هم سبد خریدت پربارتر می‌شه و هم هزینه‌ی ارسال برات کاملاً رایگان خواهد بود!
              </p>
            </div>

            {/* Dynamic Free Shipping Progress Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                <div className="flex items-center gap-2">
                  <IconTruck size={20} className={qualifiesFreeShipping ? "text-emerald-300" : "text-amber-300"} />
                  {qualifiesFreeShipping ? (
                    <span className="text-emerald-300 font-black">
                      تبریک! سفارش شما شامل ارسال کاملاً رایگان شد 🎁
                    </span>
                  ) : (
                    <span>
                      فقط{" "}
                      <strong className="text-amber-300 font-black text-sm sm:text-base font-mono">
                        {formatPersianCurrency(remaining)}
                      </strong>{" "}
                      دیگر تا ارسال رایگان کل سفارش!
                    </span>
                  )}
                </div>

                <span className="font-mono text-xs opacity-90">{progressPercent}٪</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    qualifiesFreeShipping
                      ? "bg-linear-to-r from-emerald-400 to-green-300 shadow-sm shadow-emerald-400"
                      : "bg-linear-to-r from-amber-400 to-yellow-300"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-blue-100/80 pt-0.5">
                <span>جمع سبد فعلی: {formatPersianCurrency(cartTotal)}</span>
                <span>سقف ارسال رایگان: {formatPersianCurrency(freeShippingThreshold)}</span>
              </div>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        </section>

        {/* ============================================================== */}
        {/* 2. COMPLEMENTARY & RECOMMENDED PRODUCTS (CROSS-SELL)          */}
        {/* ============================================================== */}
        {complementaryProducts && complementaryProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                  <IconSparkles size={20} className="text-amber-500" />
                  <span>محصولات پیشنهادی و مکمل برای تکمیل سبد خرید</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  محصولات محبوب و پرفروش سوغات و درمانی طب خیّر با بهترین کیفیت
                </p>
              </div>

              <Link
                href="/category/all"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>مشاهده همه محصولات</span>
                <IconArrowLeft size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {complementaryProducts.map((p) => {
                const inCartQty = cart[p.id]?.quantity || 0;
                const hasDiscount = (p.discountPercent || 0) > 0 && p.originalPrice;
                const image = p.images?.[0] || "/empty.png";

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2.5">
                        <img
                          src={image}
                          alt={p.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Badges container */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end pointer-events-none z-10">
                          {p.isSpecial && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              ویژه
                            </span>
                          )}
                          {p.isBestSeller && (
                            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              پرفروش
                            </span>
                          )}
                          {p.freeShipping && (
                            <span
                              style={{ backgroundColor: "#059669", color: "#ffffff" }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs"
                            >
                              ارسال رایگان
                            </span>
                          )}
                          {hasDiscount && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              ٪{formatPersianNumber(Number(p.discountPercent))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Name & Category */}
                      <Link
                        href={`/product/${p.id}`}
                        className="text-xs sm:text-sm font-bold text-gray-900 hover:text-blue-600 line-clamp-2 block leading-snug mb-1"
                      >
                        {p.name}
                      </Link>
                      {p.category && (
                        <span className="text-[10px] text-gray-400 block mb-2">{p.category.name}</span>
                      )}
                    </div>

                    {/* Price and Cart Button */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                      <div className="text-right">
                        <div className="font-black text-xs sm:text-sm text-gray-900">
                          {formatPersianCurrency(Number(p.price))}
                        </div>
                        {hasDiscount && (
                          <div className="text-[10px] text-gray-400 line-through">
                            {formatPersianCurrency(Number(p.originalPrice))}
                          </div>
                        )}
                      </div>

                      {/* Add/Quantity Button */}
                      {inCartQty > 0 ? (
                        <div className="flex items-center border border-blue-200 rounded-xl bg-blue-50/50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleAddProduct(p)}
                            className="w-7 h-7 flex items-center justify-center text-blue-700 hover:bg-blue-100 font-bold text-sm"
                            title="افزایش تعداد"
                          >
                            <IconPlus size={13} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-blue-900 font-mono">
                            {formatPersianNumber(inCartQty)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDecreaseProduct(p)}
                            className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-100 font-bold text-sm"
                            title="کاهش تعداد"
                          >
                            <IconMinus size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddProduct(p)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        >
                          <IconPlus size={14} />
                          <span>افزودن</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 3. ALL PRODUCT CATEGORIES GRID                                */}
        {/* ============================================================== */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <IconPackage size={20} className="text-blue-600" />
              <span>تمام دسته‌بندی‌های محصولات طِب خیّر</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              دسته‌بندی مورد نظر خود را انتخاب کرده و از میان صدها محصول باکیفیت خرید نمایید
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const productCount = cat._count?.products || 0;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all p-4 flex flex-col justify-between min-h-[140px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        {productCount > 0 ? `${formatPersianNumber(productCount)} کالا` : "مشاهده محصولات"}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-blue-50/80 flex items-center justify-center p-1.5 group-hover:scale-110 transition-transform">
                      <img
                        src={cat.thumbnail || "/backend/images/default_thumbnail.png"}
                        alt={cat.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    <span>مشاهده محصولات</span>
                    <IconArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* Floating Bottom Sticky Bar (Always visible for easy checkout on mobile/desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:px-6 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <IconShoppingCart size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-500">
                سبد خرید شما: <strong className="text-gray-900 font-bold">{formatPersianNumber(cartCount)} کالا</strong>
              </div>
              <div className="text-sm font-black text-gray-900 font-mono">
                {formatPersianCurrency(cartTotal)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!qualifiesFreeShipping && remaining > 0 && (
              <span className="hidden sm:inline-block text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-bold">
                {formatPersianCurrency(remaining)} تا ارسال رایگان
              </span>
            )}

            <Link
              href="/dashboard/cart"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              <IconShoppingCart size={16} />
              <span>مشاهده سبد و تسویه‌حساب</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
