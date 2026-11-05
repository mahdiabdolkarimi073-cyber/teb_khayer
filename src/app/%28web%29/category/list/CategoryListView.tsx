'use client';

import React, { useState, useMemo, useRef, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import {
  IconArrowsSort,
  IconLayoutGrid,
  IconList,
  IconChevronDown,
  IconCheck,
  IconSparkles,
  IconHistory,
  IconArrowDown,
  IconArrowUp,
  IconFlame,
  IconStar,
  IconCategory,
  IconChevronLeft,
  IconSearch,
  IconX,
  IconPackageOff,
} from "@tabler/icons-react";
import classes from "./category-list.module.css";

export type SortOption =
  | "default"
  | "newest"
  | "oldest"
  | "cheapest"
  | "expensive"
  | "bestseller"
  | "popular";

export type ViewMode = "grid" | "list";

export interface CategoryProduct {
  id: string;
  name?: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number;
  isBestSeller?: boolean;
  isSpecial?: boolean;
  created_at: Date | string;
}

export interface CategoryItem {
  id: string;
  name: string;
  thumbnail: string | null;
  created_at: Date | string;
  parentId?: string | null;
  products: CategoryProduct[];
}

interface CategoryListViewProps {
  categories: CategoryItem[];
  initialSort?: string;
  initialView?: ViewMode;
  initialSearch?: string;
}

const SORT_OPTIONS: {
  value: SortOption;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  description: string;
}[] = [
  {
    value: "default",
    label: "پیش‌فرض",
    icon: IconArrowsSort,
    description: "ترتیب طبیعی سیستم",
  },
  {
    value: "newest",
    label: "جدیدترین",
    icon: IconSparkles,
    description: "جدیدترین دسته‌ها و محصولات",
  },
  {
    value: "oldest",
    label: "قدیمی‌ترین",
    icon: IconHistory,
    description: "دسته‌های قدیمی‌تر",
  },
  {
    value: "cheapest",
    label: "ارزان‌ترین",
    icon: IconArrowDown,
    description: "کمترین قیمت محصولات",
  },
  {
    value: "expensive",
    label: "گران‌ترین",
    icon: IconArrowUp,
    description: "بیشترین قیمت محصولات",
  },
  {
    value: "bestseller",
    label: "پرفروش‌ترین",
    icon: IconFlame,
    description: "بیشترین محصولات پرفروش",
  },
  {
    value: "popular",
    label: "محبوب‌ترین",
    icon: IconStar,
    description: "بیشترین تنوع محصول",
  },
];

const formatPrice = (value: number) => `${Math.round(value).toLocaleString("fa-IR")} تومان`;

export default function CategoryListView({
  categories,
  initialSort = "default",
  initialView = "grid",
  initialSearch = "",
}: CategoryListViewProps) {
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const valid = SORT_OPTIONS.find((s) => s.value === initialSort);
    return valid ? valid.value : "default";
  });
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // Handle sort selection and sync to URL
  const handleSortSelect = (option: SortOption) => {
    setSortOption(option);
    setIsMenuOpen(false);

    try {
      const url = new URL(window.location.href);
      if (option === "default") {
        url.searchParams.delete("sort");
      } else {
        url.searchParams.set("sort", option);
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Safe fallback if window is unavailable
    }
  };

  // Handle view mode change and sync to URL
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      const url = new URL(window.location.href);
      if (mode === "grid") {
        url.searchParams.delete("view");
      } else {
        url.searchParams.set("view", mode);
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Safe fallback
    }
  };

  // Handle search query change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    try {
      const url = new URL(window.location.href);
      if (val.trim()) {
        url.searchParams.set("q", val.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Safe fallback
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Safe fallback
    }
  };

  // Helper functions for category price calculations
  const getMinPrice = (cat: CategoryItem) => {
    if (!cat.products || cat.products.length === 0) return Infinity;
    const prices = cat.products.map((p) => Number(p.price) || 0).filter((p) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getMaxPrice = (cat: CategoryItem) => {
    if (!cat.products || cat.products.length === 0) return 0;
    const prices = cat.products.map((p) => Number(p.price) || 0);
    return prices.length > 0 ? Math.max(...prices) : 0;
  };

  const getBestSellerCount = (cat: CategoryItem) => {
    if (!cat.products) return 0;
    return cat.products.filter((p) => Boolean(p.isBestSeller)).length;
  };

  // Perform safe sorting on a cloned copy of the categories array
  const sortedCategories = useMemo(() => {
    let result = [...categories];

    // Filter by search query if entered
    if (searchQuery.trim()) {
      const cleanQ = searchQuery.trim().toLowerCase();
      result = result.filter((cat) => cat.name.toLowerCase().includes(cleanQ));
    }

    switch (sortOption) {
      case "newest":
        return result.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });

      case "oldest":
        return result.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeA - timeB;
        });

      case "cheapest":
        return result.sort((a, b) => {
          const minA = getMinPrice(a);
          const minB = getMinPrice(b);
          return minA - minB;
        });

      case "expensive":
        return result.sort((a, b) => {
          const maxA = getMaxPrice(a);
          const maxB = getMaxPrice(b);
          return maxB - maxA;
        });

      case "bestseller":
        return result.sort((a, b) => {
          const bestA = getBestSellerCount(a);
          const bestB = getBestSellerCount(b);
          if (bestB !== bestA) return bestB - bestA;
          return (b.products?.length || 0) - (a.products?.length || 0);
        });

      case "popular":
        return result.sort((a, b) => {
          return (b.products?.length || 0) - (a.products?.length || 0);
        });

      case "default":
      default:
        return result;
    }
  }, [categories, searchQuery, sortOption]);

  const currentSortConfig =
    SORT_OPTIONS.find((s) => s.value === sortOption) || SORT_OPTIONS[0];
  const CurrentSortIcon = currentSortConfig.icon;

  return (
    <>
      <div className={classes.sectionHeader}>
        <div className={classes.titleWrapper}>
          <h2 className={classes.sectionTitle}>
            <IconLayoutGrid size={22} />
            تمام دسته‌بندی‌ها
          </h2>
          <span className={classes.categoryCountBadge}>
            {sortedCategories.length} دسته‌بندی
          </span>
        </div>

        <div className={classes.toolbar}>
          {/* Live search input */}
          <div className={classes.searchBox}>
            <span className={classes.searchIcon}>
              <IconSearch size={16} aria-hidden="true" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="جستجو در دسته‌ها..."
              className={classes.searchInput}
              aria-label="جستجو در دسته‌ها"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className={classes.searchClear}
                aria-label="پاک کردن جستجو"
                title="پاک کردن"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className={classes.sortWrapper}>
            <button
              ref={buttonRef}
              type="button"
              className={`${classes.toolButton} ${isMenuOpen ? classes.toolButtonOpen : ""}`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="listbox"
              title="تغییر مرتب‌سازی"
            >
              <span className={classes.toolButtonIcon}>
                <CurrentSortIcon size={16} aria-hidden="true" />
              </span>
              <span className={classes.toolButtonText}>
                مرتب‌سازی: <strong>{currentSortConfig.label}</strong>
              </span>
              <span
                className={`${classes.toolButtonChevron} ${isMenuOpen ? classes.toolButtonChevronOpen : ""}`}
              >
                <IconChevronDown size={15} aria-hidden="true" />
              </span>
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className={classes.sortMenu}
                role="listbox"
                aria-label="گزینه‌های مرتب‌سازی"
              >
                <div className={classes.sortMenuHeader}>مرتب‌سازی بر اساس:</div>
                {SORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = sortOption === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`${classes.sortMenuItem} ${isSelected ? classes.sortMenuItemActive : ""}`}
                      onClick={() => handleSortSelect(opt.value)}
                    >
                      <div className={classes.sortItemContent}>
                        <Icon size={16} className={classes.sortItemIcon} />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && (
                        <span className={classes.sortItemCheck}>
                          <IconCheck size={16} aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* View toggle buttons (Grid vs List) */}
          <button
            type="button"
            className={`${classes.viewButton} ${viewMode === "grid" ? classes.viewButtonActive : ""}`}
            onClick={() => handleViewChange("grid")}
            aria-label="نمای شبکه‌ای"
            title="نمای شبکه‌ای"
          >
            <IconLayoutGrid size={17} />
          </button>
          <button
            type="button"
            className={`${classes.viewButton} ${viewMode === "list" ? classes.viewButtonActive : ""}`}
            onClick={() => handleViewChange("list")}
            aria-label="نمای لیستی"
            title="نمای لیستی"
          >
            <IconList size={17} />
          </button>
        </div>
      </div>

      {/* Categories Content */}
      {sortedCategories.length === 0 ? (
        <div className={classes.emptyState}>
          <div className={classes.emptyIcon}>
            <IconPackageOff size={44} />
          </div>
          <h3 className={classes.emptyTitle}>دسته‌بندی‌ای یافت نشد</h3>
          <p className={classes.emptyText}>
            {searchQuery
              ? `هیچ دسته‌بندی با عنوان «${searchQuery}» پیدا نشد.`
              : "دسته‌بندی فعالی در این بخش موجود نیست."}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={classes.resetButton}
            >
              نمایش همه دسته‌ها
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className={classes.categoryGrid}>
          {sortedCategories.map((c) => {
            const minPrice = getMinPrice(c);
            const maxPrice = getMaxPrice(c);
            const bestCount = getBestSellerCount(c);

            return (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className={classes.categoryCard}
              >
                <div className={classes.imageFrame}>
                  <img
                    src={c.thumbnail || "/empty.png"}
                    alt={c.name}
                    className={classes.categoryImage}
                    loading="lazy"
                  />
                  <div className={classes.imageWash} />
                  <div className={classes.cardBadge}>
                    <IconCategory size={15} />
                  </div>
                </div>
                <div className={classes.cardBody}>
                  <div className={classes.cardText}>
                    <h3 className={classes.cardTitle}>{c.name}</h3>
                    <p className={classes.cardCount}>
                      {c.products?.length || 0} محصول
                    </p>

                    {/* Contextual sort badge */}
                    {sortOption === "cheapest" && minPrice > 0 && minPrice !== Infinity && (
                      <span className={classes.sortDetailBadge}>
                        شروع از {formatPrice(minPrice)}
                      </span>
                    )}
                    {sortOption === "expensive" && maxPrice > 0 && (
                      <span className={classes.sortDetailBadge}>
                        تا {formatPrice(maxPrice)}
                      </span>
                    )}
                    {sortOption === "bestseller" && bestCount > 0 && (
                      <span className={classes.sortDetailBadge}>
                        {bestCount} پرفروش
                      </span>
                    )}
                  </div>
                  <span className={classes.cardArrow}>
                    <IconChevronLeft size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={classes.categoryList}>
          {sortedCategories.map((c) => {
            const minPrice = getMinPrice(c);
            const maxPrice = getMaxPrice(c);
            const bestCount = getBestSellerCount(c);

            return (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className={classes.categoryCardList}
              >
                <div className={classes.listCardLeading}>
                  <div className={classes.listImageFrame}>
                    <img
                      src={c.thumbnail || "/empty.png"}
                      alt={c.name}
                      className={classes.listImage}
                      loading="lazy"
                    />
                  </div>
                  <div className={classes.listDetails}>
                    <h3 className={classes.listTitle}>{c.name}</h3>
                    <div className={classes.listBadges}>
                      <span className={classes.listBadge}>
                        <IconCategory size={13} />
                        {c.products?.length || 0} محصول
                      </span>
                      {bestCount > 0 && (
                        <span className={classes.listBadge}>
                          <IconFlame size={13} />
                          {bestCount} پرفروش
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={classes.listCardTrailing}>
                  {minPrice > 0 && minPrice !== Infinity && (
                    <div className={classes.listPriceInfo}>
                      <span>شروع قیمت از</span>
                      <div className={classes.listPriceValue}>
                        {formatPrice(minPrice)}
                      </div>
                    </div>
                  )}
                  <span className={classes.cardArrow}>
                    <IconChevronLeft size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
