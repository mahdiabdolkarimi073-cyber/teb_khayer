'use client';

import {Product} from "@prisma/client";
import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {getAllProductCount, getProducts, SortOption} from "@/app/(web)/category/all/action";
import {searchProductsByImage, VisualSearchResultItem} from "@/app/(web)/category/all/visual-search.action";
import {Loader, Pagination} from "@mantine/core";
import {useDebouncedState} from "@mantine/hooks";
import Link from "next/link";
import ProductLike from "@/components/shop/ProductLike";
import {
  IconCamera,
  IconCategory,
  IconGrid4x4,
  IconList,
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconShoppingCart,
  IconSparkles,
  IconStar,
  IconFlame,
  IconPercentage,
  IconAward,
  IconX,
  IconPackageOff,
  IconArrowLeft,
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
  const [debouncedSearch, setDebouncedSearch] = useDebouncedState(initialSearch, 300);
  const [skip, setSkip] = useState(0);
  const [sort, setSort] = useState<SortOption>(props.sort || "new");
  const [products, setProducts] = useState<Product[]>(props.products || []);
  const [count, setCount] = useState(props.count || 0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Visual search states
  const [visualMatches, setVisualMatches] = useState<VisualSearchResultItem[] | null>(null);
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [visualSearchPending, setVisualSearchPending] = useState(false);
  const [visualSearchMessage, setVisualSearchMessage] = useState<string | null>(null);
  const [visualFeatures, setVisualFeatures] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const activeRequestIdRef = useRef(0);
  const isFirstRender = useRef(true);

  // Live search effect on query, sort, or pagination change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // If visual search is currently displayed, do not overwrite unless user typed text
    if (visualMatches && !debouncedSearch.trim()) {
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

  // Convert image file to base64 data url and trigger real visual analysis
  const processImageFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("لطفاً یک فایل تصویری معتبر (JPG, PNG, WebP) انتخاب کنید.");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      alert("حجم تصویر انتخاب‌شده بیشتر از ۱۲ مگابایت است. لطفاً تصویر کم‌حجم‌تری انتخاب کنید.");
      return;
    }

    setVisualSearchPending(true);
    setVisualSearchMessage("در حال پردازش و تحلیل مشخصات بصری محصول...");
    setVisualMatches(null);
    setVisualFeatures(null);
    setSearchTerm("");
    setDebouncedSearch("");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        setVisualSearchPending(false);
        setVisualSearchMessage("خطا در خواندن فایل تصویر.");
        return;
      }

      setVisualPreview(dataUrl);

      try {
        const result = await searchProductsByImage(dataUrl);
        setVisualSearchPending(false);
        if (result.success && result.items.length > 0) {
          setVisualMatches(result.items);
          setVisualSearchMessage(result.message);
          setVisualFeatures(result.detectedFeatures || null);
        } else {
          setVisualMatches([]);
          setVisualSearchMessage(result.message || "هیچ محصول مشابهی برای این تصویر در فروشگاه یافت نشد.");
          setVisualFeatures(null);
        }
      } catch (err) {
        console.error("Visual search error:", err);
        setVisualSearchPending(false);
        setVisualSearchMessage("ارتباط با سرویس تحلیل تصویر برقرار نشد. لطفاً دوباره تلاش کنید.");
      }
    };

    reader.onerror = () => {
      setVisualSearchPending(false);
      setVisualSearchMessage("خطا در بارگذاری تصویر.");
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      processImageFile(file);
    }
  };

  const clearVisualSearch = () => {
    setVisualPreview(null);
    setVisualMatches(null);
    setVisualSearchMessage(null);
    setVisualFeatures(null);
    setVisualSearchPending(false);
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

  const displayedProducts = visualMatches ? visualMatches.map((item) => item.product) : products;

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
            <h1 className={styles.catalogHeading}>
              {visualMatches ? "نتایج جستجوی تصویری" : "همه محصولات"}
            </h1>
            <p className={styles.catalogCount}>
              {visualSearchPending
                ? "در حال تحلیل تصویر..."
                : visualMatches
                ? `${visualMatches.length.toLocaleString("fa-IR")} محصول با بیشترین شباهت ظاهری`
                : isSearching
                ? "در حال جستجوی زنده..."
                : `${count.toLocaleString("fa-IR")} محصول موجود است`}
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

        {/* Search Bar with prominently highlighted red «طِب خیّر» and camera/gallery buttons */}
        <div className={styles.searchArea}>
          <div className={styles.search} dir="rtl">
            {/* Right side: Magnifier Icon */}
            <div className={styles.searchIconWrapper}>
              <IconSearch size={22} aria-hidden="true" />
            </div>

            {/* Input with styled placeholder featuring red bold «طِب خیّر» */}
            <div className={styles.inputContainer}>
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="جستجوی نام محصول در طِب خیّر"
              />
              {!searchTerm && (
                <div
                  className={styles.styledPlaceholder}
                  onClick={() => searchInputRef.current?.focus()}
                >
                  <span>جستجو در</span>
                  <span className={styles.brandHighlight}>طِب خیّر</span>
                  <span className={styles.placeholderHint}>(نام محصول...)</span>
                </div>
              )}
            </div>

            {/* Clear Text Search Button */}
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

            {/* Visual Search Actions: Direct Mobile Camera & File Gallery */}
            <div className={styles.visualSearchGroup}>
              {/* Camera Button (opens mobile camera directly with capture="environment") */}
              <button
                type="button"
                className={styles.cameraButton}
                onClick={() => cameraInputRef.current?.click()}
                aria-label="عکس با دوربین موبایل"
                title="عکس با دوربین موبایل"
              >
                <IconCamera size={18} aria-hidden="true" />
                <span>دوربین</span>
              </button>

              {/* Gallery Button (select from device gallery/files) */}
              <button
                type="button"
                className={styles.galleryButton}
                onClick={() => galleryInputRef.current?.click()}
                aria-label="انتخاب تصویر از گالری"
                title="انتخاب از گالری"
              >
                <IconPhoto size={18} aria-hidden="true" />
                <span>گالری</span>
              </button>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
              />
              <input
                ref={galleryInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileInputChange}
              />
            </div>
          </div>

          {/* Visual Search Interactive Preview & Control Panel */}
          {(visualPreview || visualSearchPending || visualSearchMessage) && (
            <div className={styles.visualSearchPanel}>
              {visualPreview && (
                <div className={styles.visualPreviewContainer}>
                  <img
                    className={styles.visualPreview}
                    src={visualPreview}
                    alt="تصویر ارسالی برای جستجوی بصری"
                  />
                </div>
              )}
              <div className={styles.visualSearchCopy}>
                <div className={styles.visualSearchTitle}>
                  <IconSparkles size={18} />
                  <span>تحلیل بصری و هوشمند محصول</span>
                  {visualMatches && (
                    <span className={styles.visualSearchTitleBadge}>
                      {visualMatches.length.toLocaleString("fa-IR")} محصول منطبق
                    </span>
                  )}
                </div>
                <p>
                  {visualSearchPending ? (
                    <span className="flex items-center gap-2">
                      <Loader size="xs" color="blue" />
                      در حال بررسی شکل، بسته‌بندی، رنگ و هویت محصول در کاتالوگ طِب خیّر...
                    </span>
                  ) : (
                    visualSearchMessage
                  )}
                </p>
                {visualFeatures && (
                  <small>ویژگی‌های تشخیص داده شده: {visualFeatures}</small>
                )}
                <div className={styles.visualActionButtons}>
                  <button
                    type="button"
                    className={styles.changeImageBtn}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    تغییر تصویر
                  </button>
                  <button
                    type="button"
                    className={styles.changeImageBtn}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    عکس جدید با دوربین
                  </button>
                </div>
              </div>
              <button
                type="button"
                className={styles.clearVisualSearch}
                onClick={clearVisualSearch}
                aria-label="بستن جستجوی تصویری"
                title="بستن و بازگشت به همه محصولات"
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

        {/* Visual search result notification banner */}
        {visualMatches && visualMatches.length > 0 && (
          <div className={styles.visualResultNotice}>
            <span>
              محصولات زیر بر اساس بالاترین میزان شباهت ظاهری و نوع کالا مرتب شده‌اند:
            </span>
            <button
              type="button"
              onClick={clearVisualSearch}
              className="text-emerald-800 text-xs hover:underline font-bold"
            >
              نمایش همه محصولات
            </button>
          </div>
        )}

        {visualMatches ? null : pagination}

        {/* Empty Search Result State */}
        {!isSearching && !visualSearchPending && displayedProducts.length === 0 ? (
          <div className={styles.emptySearch}>
            <IconPackageOff size={44} className="text-gray-400 mb-2" />
            <div className={styles.emptySearchTitle}>
              {visualMatches !== null
                ? "هیچ محصول مشابهی برای این تصویر در فروشگاه یافت نشد"
                : searchTerm.trim()
                ? `هیچ محصولی با نام «${searchTerm.trim()}» یافت نشد`
                : "هیچ محصولی یافت نشد"}
            </div>
            <p className={styles.emptySearchText}>
              {visualMatches !== null
                ? "لطفاً از زاویه‌ای واضح‌تر یا با نور کافی از محصول عکس بگیرید، یا نام آن را جستجو کنید."
                : "جستجوی متنی فقط بر اساس نام محصول انجام می‌شود. لطفاً نام محصول را کوتاه و بدون عبارات اضافی وارد کنید."}
            </p>
            {(searchTerm || visualMatches) && (
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

              // Find visual match item if in visual search mode
              const matchItem = visualMatches?.find((m) => m.product.id === product.id);

              return (
                <article className={styles.productCard} key={product.id}>
                  <div className={styles.badgeRow}>
                    {matchItem && (
                      <span className={styles.visualMatchScoreBadge}>
                        ٪{matchItem.similarityScore.toLocaleString("fa-IR")} شباهت بصری
                      </span>
                    )}
                    {product.isSpecial && <span className={`${styles.badge} ${styles.badgeSpecial}`}>ویژه</span>}
                    {product.isBestSeller && <span className={`${styles.badge} ${styles.badgeBestSeller}`}>پرفروش</span>}
                    {hasDiscount && (
                      <span className={`${styles.badge} ${styles.badgeDiscount}`}>
                        ٪{product.discountPercent.toLocaleString("fa-IR")} تخفیف
                      </span>
                    )}
                    {outOfStock && <span className={`${styles.badge} ${styles.badgeOutOfStock}`}>ناموجود</span>}
                  </div>

                  <Link href={`/product/${product.id}`} className="block">
                    <img
                      loading="lazy"
                      className={styles.productImage}
                      src={firstImage}
                      alt={product.name}
                    />
                  </Link>

                  <div className={styles.productBody}>
                    <Link href={`/product/${product.id}`} className="block">
                      <h2 className={styles.productName} title={product.name}>
                        {product.name}
                      </h2>
                    </Link>

                    {matchItem && (
                      <div className={styles.visualMatchReason}>
                        {matchItem.matchReason}
                      </div>
                    )}

                    <div className={styles.priceRow}>
                      <span className={styles.productPrice}>
                        {Number(product.price).toLocaleString("fa-IR")} تومان
                      </span>
                      {hasDiscount && product.originalPrice && (
                        <span className={styles.productOldPrice}>
                          {Number(product.originalPrice).toLocaleString("fa-IR")} تومان
                        </span>
                      )}
                    </div>

                    <div className={styles.productFooter}>
                      <Link href={`/product/${product.id}`} className={styles.productLink}>
                        <IconShoppingCart size={16} />
                        مشاهده و خرید
                      </Link>
                      <ProductLike id={product.id} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {visualMatches ? null : pagination}
      </div>
    </section>
  );
};

export default AllProductView;
