'use client';

import {Product} from "@prisma/client";
import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {getAllProductCount, getProducts, SortOption} from "@/app/(web)/category/all/action";
import {Loader, Pagination} from "@mantine/core";
import Loading from "@/app/(app)/loading";
import {useDebouncedState} from "@mantine/hooks";
import Link from "next/link";
import ProductLike from "@/components/shop/ProductLike";
import {
  IconCamera,
  IconCategory,
  IconGrid4x4,
  IconList,
  IconSearch,
  IconShoppingCart,
  IconSparkles,
  IconStar,
  IconFlame,
  IconPercentage,
  IconAward,
  IconX,
  IconPackageOff
} from "@tabler/icons-react";
import styles from "./all-products.module.css";

const categories = [
  "همه محصولات",
  "محصولات سلامت",
  "گیاهان دارویی",
  "مواد غذایی و خوراکی",
  "پوشاک و اکسسوری",
  "کتاب و لوازم فرهنگی",
  "لوازم دیجیتال",
  "زیبایی و سلامت",
  "ورزش و سفر"
];

const filterTabs: { label: string; value: SortOption; icon: any }[] = [
  { label: "جدیدترین", value: "new", icon: IconSparkles },
  { label: "پرفروش‌ترین", value: "bestSeller", icon: IconFlame },
  { label: "تخفیف‌دار", value: "discount", icon: IconPercentage },
  { label: "ویژه", value: "special", icon: IconAward },
  { label: "ارزان‌ترین", value: "priceLow", icon: IconStar },
  { label: "گران‌ترین", value: "priceHigh", icon: IconStar },
];

type ImageSignature = { red: number; green: number; blue: number; brightness: number; aspect: number };

async function readImageSignature(source: string): Promise<ImageSignature | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(null);
        return;
      }
      context.drawImage(image, 0, 0, size, size);
      try {
        const pixels = context.getImageData(0, 0, size, size).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let brightness = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          red += pixels[index];
          green += pixels[index + 1];
          blue += pixels[index + 2];
          brightness += (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
        }
        const pixelsCount = pixels.length / 4;
        resolve({
          red: red / pixelsCount / 255,
          green: green / pixelsCount / 255,
          blue: blue / pixelsCount / 255,
          brightness: brightness / pixelsCount / 255,
          aspect: image.width / image.height,
        });
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

function signatureDistance(first: ImageSignature, second: ImageSignature) {
  const colorDistance = Math.abs(first.red - second.red) + Math.abs(first.green - second.green) + Math.abs(first.blue - second.blue);
  const brightnessDistance = Math.abs(first.brightness - second.brightness);
  const aspectDistance = Math.min(Math.abs(first.aspect - second.aspect), 1);
  return colorDistance * 0.6 + brightnessDistance * 0.25 + aspectDistance * 0.15;
}

const AllProductView = (props: {
  products: Product[];
  count: number;
  search?: string;
  sort?: SortOption;
  saleEnabled?: boolean;
  id?: string;
}) => {
  const MAX = 20;
  const initialSearch = (props.search || "").trim();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useDebouncedState(initialSearch, 250);
  const [skip, setSkip] = useState(0);
  const [sort, setSort] = useState<SortOption>(props.sort || "new");
  const [products, setProducts] = useState<Product[]>(props.products || []);
  const [count, setCount] = useState(props.count || 0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [visualResults, setVisualResults] = useState<Product[] | null>(null);
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [visualSearchPending, setVisualSearchPending] = useState(false);
  const [visualSearchMessage, setVisualSearchMessage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeRequestIdRef = useRef(0);
  const isFirstRender = useRef(true);

  // Live search effect on query, sort, or pagination change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentRequestId = ++activeRequestIdRef.current;
    setIsSearching(true);
    setSearchError(null);

    const cleanQuery = debouncedSearch.trim() || undefined;

    Promise.all([
      getProducts(skip, cleanQuery, MAX, sort),
      getAllProductCount(cleanQuery, sort)
    ])
      .then(([fetchedProducts, fetchedCount]) => {
        // Ensure stale responses from previous keystrokes do not overwrite latest results
        if (currentRequestId === activeRequestIdRef.current) {
          setProducts(fetchedProducts || []);
          setCount(typeof fetchedCount === "number" ? fetchedCount : (fetchedProducts?.length || 0));
          setIsSearching(false);
        }
      })
      .catch((err) => {
        if (currentRequestId === activeRequestIdRef.current) {
          console.error("Live search failed:", err);
          setSearchError("خطا در جستجوی محصولات");
          setIsSearching(false);
        }
      });
  }, [debouncedSearch, skip, sort]);

  // When search query changes: reset pagination to first page and keep URL in sync
  useEffect(() => {
    setSkip(0);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (debouncedSearch.trim()) {
        url.searchParams.set("query", debouncedSearch.trim());
      } else {
        url.searchParams.delete("query");
      }
      window.history.replaceState({}, "", url.toString());
    }
  }, [debouncedSearch]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.currentTarget.value;
    clearVisualSearch();
    setSearchTerm(val);
    setDebouncedSearch(val);
  };

  const handleClearSearch = () => {
    clearVisualSearch();
    setSearchTerm("");
    setDebouncedSearch("");
    setSkip(0);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setSkip(0);
  };

  const pagination = (
    <div className={styles.pagination}>
      <Pagination
        total={Math.max(Math.ceil(count / MAX), 1)}
        value={Math.max(Math.floor(skip / MAX) + 1, 1)}
        onChange={(page) => {
          setSkip((page - 1) * MAX);
          window.scrollTo({ top: 400, behavior: "smooth" });
        }}
      />
    </div>
  );

  const handleVisualSearch = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setVisualSearchPending(true);
    setVisualSearchMessage(null);
    setVisualResults(null);
    const preview = URL.createObjectURL(file);
    setVisualPreview(preview);
    const uploadedSignature = await readImageSignature(preview);
    if (!uploadedSignature) {
      setVisualSearchPending(false);
      setVisualSearchMessage("امکان تحلیل این تصویر وجود ندارد. لطفاً تصویر دیگری انتخاب کنید.");
      return;
    }
    const scoredProducts = await Promise.all(
      products.map(async (product) => {
        const hasImg = Array.isArray(product?.images) && product.images.length > 0;
        const firstImg = hasImg && typeof product?.images?.[0] === "string" ? product.images[0] : "/empty.png";
        const signature = await readImageSignature(firstImg);
        return {
          product,
          score: signature ? signatureDistance(uploadedSignature, signature) : Number.POSITIVE_INFINITY
        };
      })
    );
    const matches = scoredProducts
      .filter(({score}) => Number.isFinite(score))
      .sort((first, second) => first.score - second.score)
      .slice(0, 6)
      .map(({product}) => product);
    setVisualResults(matches);
    setVisualSearchMessage(
      matches.length
        ? `${matches.length.toLocaleString("fa-IR")} محصول با شباهت تصویری بیشتر پیدا شد`
        : "محصول مشابهی در این صفحه پیدا نشد"
    );
    setVisualSearchPending(false);
  };

  const clearVisualSearch = () => {
    if (visualPreview) URL.revokeObjectURL(visualPreview);
    setVisualPreview(null);
    setVisualResults(null);
    setVisualSearchMessage(null);
  };

  const displayedProducts = visualResults || products;

  return (
    <section className={styles.shell} id={props.id}>
      <aside className={styles.sidebar} id="categories">
        <h2 className={styles.sidebarTitle}><IconCategory size={20} /> دسته‌بندی‌ها</h2>
        {categories.map((category, index) => (
          <button
            className={`${styles.categoryButton} ${index === 0 ? styles.categoryActive : ""}`}
            key={category}
            type="button"
          >
            {index === 0 ? <IconSparkles size={17} /> : <IconCategory size={17} />}
            {category}
          </button>
        ))}
        <div className={styles.promo}>
          <img
            className={styles.promoImage}
            src="/ChatGPT_Image_Sep_14,_2026,_11_49_32_AM.png"
            alt="محصولات سلامت طِب خیّر"
          />
          <div className={styles.promoContent}>
            <div className={styles.promoTitle}>پیشنهاد ویژه طِب خیّر</div>
            <p className={styles.promoText}>انتخابی مطمئن برای سلامت شما</p>
            <Link className={styles.promoButton} href="#products">مشاهده محصولات</Link>
          </div>
        </div>
      </aside>

      <div className={styles.catalog}>
        <div className={styles.catalogHeader}>
          <div>
            <h1 className={styles.catalogHeading}>همه محصولات</h1>
            <p className={styles.catalogCount}>
              {isSearching ? "در حال جستجو..." : `${count.toLocaleString("fa-IR")} محصول موجود است`}
            </p>
          </div>
          <div className={styles.tools}>
            <span className={styles.view}><IconGrid4x4 size={18} /></span>
            <span className={styles.view}><IconList size={18} /></span>
          </div>
        </div>

        <div className={styles.filterTabs}>
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                className={`${styles.filterTab} ${sort === tab.value ? styles.filterTabActive : ""}`}
                type="button"
                onClick={() => handleSortChange(tab.value)}
              >
                <Icon size={16} aria-hidden="true" />
                <span className={styles.filterTabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar: In RTL, Magnifier is on the RIGHT, Visual Search is on the LEFT */}
        <div className={styles.searchArea}>
          <div className={styles.search} dir="rtl">
            {/* Right side: Magnifier Icon */}
            <div className={styles.searchIconWrapper}>
              <IconSearch size={22} aria-hidden="true" />
            </div>

            {/* Center: Live Search Input */}
            <input
              type="text"
              className={styles.searchInput}
              placeholder="جستجو در طِب خیّر"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="جستجو در طِب خیّر"
            />

            {/* Clear Button */}
            {searchTerm && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearSearch}
                aria-label="پاک کردن جستجو"
                title="پاک کردن جستجو"
              >
                <IconX size={16} />
              </button>
            )}

            {/* Loading Indicator */}
            {isSearching && (
              <div className={styles.searchSpinner}>
                <Loader size="xs" color="blue" />
              </div>
            )}

            {/* Left side: Visual Search Button */}
            <button
              type="button"
              className={styles.visualSearchButton}
              onClick={() => imageInputRef.current?.click()}
              aria-label="جستجوی تصویری محصولات"
              title="جستجوی تصویری"
            >
              <IconCamera size={21} aria-hidden="true" />
              <span>جستجوی تصویری</span>
            </button>
            <input
              ref={imageInputRef}
              className={styles.hiddenFileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleVisualSearch}
            />
          </div>

          {(visualPreview || visualSearchPending || visualSearchMessage) && (
            <div className={styles.visualSearchPanel}>
              {visualPreview && (
                <img className={styles.visualPreview} src={visualPreview} alt="تصویر انتخاب‌شده برای جستجو" />
              )}
              <div className={styles.visualSearchCopy}>
                <div className={styles.visualSearchTitle}>
                  <IconSparkles size={18} /> تحلیل تصویری داخلی
                </div>
                <p>
                  {visualSearchPending
                    ? "در حال بررسی رنگ، فرم و ویژگی‌های بصری تصویر در همین دستگاه..."
                    : visualSearchMessage}
                </p>
                <small>تصویر شما به هیچ سرویس بیرونی ارسال نمی‌شود.</small>
              </div>
              <button
                type="button"
                className={styles.clearVisualSearch}
                onClick={clearVisualSearch}
                aria-label="پاک کردن جستجوی تصویری"
              >
                <IconX size={18} />
              </button>
            </div>
          )}
        </div>

        {searchError && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200 text-center">
            {searchError}
          </div>
        )}

        {visualResults ? null : pagination}

        {/* Empty Search Result State */}
        {!visualResults && !isSearching && displayedProducts.length === 0 ? (
          <div className={styles.emptySearch}>
            <IconPackageOff size={44} className="text-gray-400 mb-2" />
            <div className={styles.emptySearchTitle}>
              {searchTerm.trim()
                ? `هیچ محصولی با نام «${searchTerm.trim()}» یافت نشد`
                : "هیچ محصولی یافت نشد"}
            </div>
            <p className={styles.emptySearchText}>
              جستجو صرفاً در عنوان و نام محصولات انجام می‌شود. لطفاً نام محصول را کوتاه، با املای دقیق و بدون عبارات اضافی وارد کنید.
            </p>
            {searchTerm && (
              <button type="button" className={styles.emptySearchButton} onClick={handleClearSearch}>
                پاک کردن جستجو و نمایش همه محصولات
              </button>
            )}
          </div>
        ) : (
          <div className={styles.products}>
            {displayedProducts.map((product) => {
              const outOfStock =
                (props.saleEnabled === false && !product.forceAvailable) || !product.stock || product.stock <= 0;
              const hasDiscount = (product.discountPercent || 0) > 0;
              const hasImages = Array.isArray(product?.images) && product.images.length > 0;
              const firstImage = hasImages && typeof product?.images?.[0] === "string" ? product.images[0] : "/empty.png";

              return (
                <article className={styles.productCard} key={product.id}>
                  <div className={styles.badgeRow}>
                    {product.isSpecial && <span className={`${styles.badge} ${styles.badgeSpecial}`}>ویژه</span>}
                    {product.isBestSeller && <span className={`${styles.badge} ${styles.badgeBestSeller}`}>پرفروش</span>}
                    {hasDiscount && (
                      <span className={`${styles.badge} ${styles.badgeDiscount}`}>
                        ٪{product.discountPercent.toLocaleString("fa-IR")} تخفیف
                      </span>
                    )}
                    {outOfStock && <span className={`${styles.badge} ${styles.badgeOutOfStock}`}>ناموجود</span>}
                  </div>
                  <Link href={`/product/${product.id}`}>
                    <img
                      className={styles.productImage}
                      src={firstImage}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/empty.png";
                      }}
                    />
                  </Link>
                  <div className={styles.productBody}>
                    <div className={styles.productName}>{product.name}</div>
                    <p className={styles.productDescription}>
                      {product.description_text || "محصول باکیفیت از مجموعه طِب خیّر"}
                    </p>
                    <div className={styles.priceRow}>
                      {hasDiscount && product.originalPrice ? (
                        <>
                          <span className={styles.productOldPrice}>
                            {product.originalPrice.toLocaleString("fa-IR")}
                          </span>
                          <span className={styles.productPrice}>{product.price.toLocaleString("fa-IR")} تومان</span>
                        </>
                      ) : (
                        <span className={styles.productPrice}>{product.price.toLocaleString("fa-IR")} تومان</span>
                      )}
                    </div>
                    <div className={styles.productFooter}>
                      <Link className={styles.productLink} href={`/product/${product.id}`}>
                        <IconShoppingCart size={15} />
                        {outOfStock ? "مشاهده محصول" : "افزودن به سبد"}
                      </Link>
                      <ProductLike id={product.id} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!visualResults && pagination}
      </div>
    </section>
  );
};

export default AllProductView;
