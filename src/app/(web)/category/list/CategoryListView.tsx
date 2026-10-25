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
  IconRotateClockwise,
  IconCornerDownLeft,
  IconArrowLeft,
  IconBox,
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
  name: string;
  description?: string;
  description_text?: string;
  properties?: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number;
  isBestSeller?: boolean;
  isSpecial?: boolean;
  freeShipping?: boolean;
  stock?: number;
  forceAvailable?: boolean;
  images: string[];
  created_at: string;
  updated_at?: string;
  categoryId: string;
}

export interface SubCategoryItem {
  id: string;
  name: string;
  thumbnail: string | null;
  parentId: string;
  created_at: string;
  products: CategoryProduct[];
}

export interface CategoryItem {
  id: string;
  name: string;
  thumbnail: string | null;
  created_at: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  products: CategoryProduct[];
  children?: SubCategoryItem[];
}

interface CategoryListViewProps {
  categories: CategoryItem[];
  initialSort?: string;
  initialView?: ViewMode;
  initialSearch?: string;
  initialCategory?: string;
  initialSub?: string;
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

const formatPrice = (value: number) =>
  `${Math.round(value).toLocaleString("fa-IR")} تومان`;

export default function CategoryListView({
  categories,
  initialSort = "default",
  initialView = "grid",
  initialSearch = "",
  initialCategory,
  initialSub,
}: CategoryListViewProps) {
  // Category and subcategory selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategory || null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(
    initialSub || null
  );

  // Sorting, View Mode, and Search states
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const valid = SORT_OPTIONS.find((s) => s.value === initialSort);
    return valid ? valid.value : "default";
  });
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Switch between categories view and direct product view if desired
  const [activeTab, setActiveTab] = useState<"categories" | "products">("categories");

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

  // Sync URL parameters safely
  const updateUrlParams = (updates: Record<string, string | null>) => {
    try {
      const url = new URL(window.location.href);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          url.searchParams.delete(key);
        } else {
          url.searchParams.set(key, value);
        }
      });
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Safe fallback
    }
  };

  // Identify root/main categories (those with parentId == null)
  const mainCategories = useMemo(() => {
    const roots = categories.filter((c) => !c.parentId);
    return roots.length > 0 ? roots : categories;
  }, [categories]);

  // Find currently selected main category
  const activeMainCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Available subcategories for the active main category
  const availableSubcategories = useMemo(() => {
    if (!activeMainCategory) return [];
    if (activeMainCategory.children && activeMainCategory.children.length > 0) {
      return activeMainCategory.children;
    }
    return categories.filter((c) => c.parentId === activeMainCategory.id);
  }, [categories, activeMainCategory]);

  // Active subcategory if any
  const activeSubCategory = useMemo(() => {
    if (!selectedSubCategoryId) return null;
    return availableSubcategories.find((s) => s.id === selectedSubCategoryId) || null;
  }, [availableSubcategories, selectedSubCategoryId]);

  // Total unique products count in entire store
  const totalStoreProductsCount = useMemo(() => {
    const ids = new Set<string>();
    categories.forEach((cat) => {
      cat.products?.forEach((p) => ids.add(p.id));
      cat.children?.forEach((ch) => ch.products?.forEach((p) => ids.add(p.id)));
    });
    return ids.size;
  }, [categories]);

  // Get total products for a specific category (including its children)
  const getCategoryProductCount = (cat: CategoryItem) => {
    const direct = cat.products?.length || 0;
    const childrenTotal = (cat.children || []).reduce(
      (sum, child) => sum + (child.products?.length || 0),
      0
    );
    return direct + childrenTotal;
  };

  // Category price calculation helpers
  const getMinPrice = (cat: CategoryItem | SubCategoryItem) => {
    if (!cat.products || cat.products.length === 0) return Infinity;
    const prices = cat.products.map((p) => Number(p.price) || 0).filter((p) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getMaxPrice = (cat: CategoryItem | SubCategoryItem) => {
    if (!cat.products || cat.products.length === 0) return 0;
    const prices = cat.products.map((p) => Number(p.price) || 0);
    return prices.length > 0 ? Math.max(...prices) : 0;
  };

  const getBestSellerCount = (cat: CategoryItem | SubCategoryItem) => {
    if (!cat.products) return 0;
    return cat.products.filter((p) => Boolean(p.isBestSeller)).length;
  };

  // Handle category selection & toggling
  const handleSelectCategory = (catId: string | null) => {
    if (catId === selectedCategoryId || catId === null) {
      // Toggle off / deselect
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      updateUrlParams({ category: null, sub: null });
    } else {
      setSelectedCategoryId(catId);
      setSelectedSubCategoryId(null);
      updateUrlParams({ category: catId, sub: null });
    }
  };

  // Handle subcategory selection & toggling
  const handleSelectSubCategory = (subId: string | null) => {
    if (subId === selectedSubCategoryId || subId === null) {
      setSelectedSubCategoryId(null);
      updateUrlParams({ sub: null });
    } else {
      setSelectedSubCategoryId(subId);
      updateUrlParams({ sub: subId });
    }
  };

  // Clear all category filters
  const handleClearCategoryFilter = () => {
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    updateUrlParams({ category: null, sub: null });
  };

  // Handle sort selection and sync to URL
  const handleSortSelect = (option: SortOption) => {
    setSortOption(option);
    setIsMenuOpen(false);
    updateUrlParams({ sort: option === "default" ? null : option });
  };

  // Handle view mode change and sync to URL
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateUrlParams({ view: mode === "grid" ? null : mode });
  };

  // Handle search query change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateUrlParams({ q: val.trim() ? val.trim() : null });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateUrlParams({ q: null });
  };

  // Filter and sort Categories
  const filteredAndSortedCategories = useMemo(() => {
    let list: CategoryItem[] = [];

    if (selectedSubCategoryId) {
      // If a subcategory is picked, show that subcategory as the targeted item
      const sub = availableSubcategories.find((s) => s.id === selectedSubCategoryId);
      if (sub) {
        list = [
          {
            id: sub.id,
            name: sub.name,
            thumbnail: sub.thumbnail,
            created_at: sub.created_at,
            parentId: sub.parentId,
            products: sub.products,
          },
        ];
      }
    } else if (selectedCategoryId && activeMainCategory) {
      // Show the active category and its subcategories as cards
      const subCards: CategoryItem[] = availableSubcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        thumbnail: sub.thumbnail || activeMainCategory.thumbnail,
        created_at: sub.created_at,
        parentId: sub.parentId,
        products: sub.products,
      }));
      list = [activeMainCategory, ...subCards];
    } else {
      // Show all main categories
      list = [...mainCategories];
    }

    // Filter by search query if entered
    if (searchQuery.trim()) {
      const cleanQ = searchQuery.trim().toLowerCase();
      list = list.filter((cat) => cat.name.toLowerCase().includes(cleanQ));
    }

    // Sort categories
    switch (sortOption) {
      case "newest":
        return list.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });

      case "oldest":
        return list.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeA - timeB;
        });

      case "cheapest":
        return list.sort((a, b) => {
          const minA = getMinPrice(a);
          const minB = getMinPrice(b);
          return minA - minB;
        });

      case "expensive":
        return list.sort((a, b) => {
          const maxA = getMaxPrice(a);
          const maxB = getMaxPrice(b);
          return maxB - maxA;
        });

      case "bestseller":
        return list.sort((a, b) => {
          const bestA = getBestSellerCount(a);
          const bestB = getBestSellerCount(b);
          if (bestB !== bestA) return bestB - bestA;
          return (b.products?.length || 0) - (a.products?.length || 0);
        });

      case "popular":
        return list.sort((a, b) => {
          return (b.products?.length || 0) - (a.products?.length || 0);
        });

      case "default":
      default:
        return list;
    }
  }, [
    categories,
    mainCategories,
    selectedCategoryId,
    selectedSubCategoryId,
    activeMainCategory,
    availableSubcategories,
    searchQuery,
    sortOption,
  ]);

  // Extract, filter, and sort all products belonging to current filter
  const filteredAndSortedProducts = useMemo(() => {
    const prodMap = new Map<string, CategoryProduct>();

    if (selectedSubCategoryId) {
      const sub = availableSubcategories.find((s) => s.id === selectedSubCategoryId);
      sub?.products?.forEach((p) => prodMap.set(p.id, p));
    } else if (selectedCategoryId && activeMainCategory) {
      activeMainCategory.products?.forEach((p) => prodMap.set(p.id, p));
      availableSubcategories.forEach((sub) => {
        sub.products?.forEach((p) => prodMap.set(p.id, p));
      });
    } else {
      categories.forEach((c) => {
        c.products?.forEach((p) => prodMap.set(p.id, p));
        c.children?.forEach((ch) => ch.products?.forEach((p) => prodMap.set(p.id, p)));
      });
    }

    let list = Array.from(prodMap.values());

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Sort products
    switch (sortOption) {
      case "cheapest":
        return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case "expensive":
        return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case "newest":
        return list.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      case "oldest":
        return list.sort(
          (a, b) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
      case "bestseller":
        return list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      case "popular":
        return list.sort((a, b) => (b.isSpecial ? 1 : 0) - (a.isSpecial ? 1 : 0));
      case "default":
      default:
        return list;
    }
  }, [
    categories,
    selectedCategoryId,
    selectedSubCategoryId,
    activeMainCategory,
    availableSubcategories,
    searchQuery,
    sortOption,
  ]);

  const currentSortConfig =
    SORT_OPTIONS.find((s) => s.value === sortOption) || SORT_OPTIONS[0];
  const CurrentSortIcon = currentSortConfig.icon;

  const activeCategoryTitle = activeSubCategory
    ? `${activeMainCategory?.name} › ${activeSubCategory.name}`
    : activeMainCategory
    ? activeMainCategory.name
    : null;

  return (
    <div className={classes.catalogWrapper}>
      {/* 1. PROFESSIONAL CATEGORY FILTER SHOWCASE */}
      <section
        className={classes.filterSection}
        aria-label="فیلتر دسته‌بندی‌های فروشگاه"
      >
        <div className={classes.filterSectionHeader}>
          <div className={classes.filterHeaderTitle}>
            <div className={classes.filterIconBadge} aria-hidden="true">
              <IconCategory size={20} />
            </div>
            <div>
              <h3 className={classes.filterTitle}>فیلتر دسته‌بندی محصولات</h3>
              <p className={classes.filterSubtitle}>
                دسته‌بندی مورد نظر خود را برای مشاهده فوری محصولات و زیرمجموعه‌ها انتخاب کنید
              </p>
            </div>
          </div>

          {/* Active Filter Badge & Clear Action */}
          {selectedCategoryId && (
            <div className={classes.activeFilterActions}>
              <div className={classes.activeFilterPill}>
                <span className={classes.activeFilterLabel}>دسته انتخابی:</span>
                <strong className={classes.activeFilterName}>
                  {activeCategoryTitle}
                </strong>
                <button
                  type="button"
                  onClick={handleClearCategoryFilter}
                  className={classes.activeFilterRemove}
                  title="لغو فیلتر دسته‌بندی"
                  aria-label="لغو فیلتر دسته‌بندی"
                >
                  <IconX size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleClearCategoryFilter}
                className={classes.clearAllFiltersBtn}
              >
                <IconRotateClockwise size={14} />
                نمایش همه دسته‌ها
              </button>
            </div>
          )}
        </div>

        {/* Main Categories Cards Row */}
        <div className={classes.mainCategoriesGrid} role="tablist">
          {/* Card: All Categories */}
          <button
            type="button"
            role="tab"
            aria-selected={!selectedCategoryId}
            className={`${classes.categoryFilterCard} ${
              !selectedCategoryId ? classes.categoryFilterCardActive : ""
            }`}
            onClick={() => handleSelectCategory(null)}
          >
            <div className={classes.categoryCardThumbWrapper}>
              <div className={classes.categoryAllIconCircle}>
                <IconSparkles size={22} aria-hidden="true" />
              </div>
            </div>
            <div className={classes.categoryCardMeta}>
              <span className={classes.categoryCardName}>همه دسته‌ها</span>
              <span className={classes.categoryCardCount}>
                {totalStoreProductsCount.toLocaleString("fa-IR")} محصول
              </span>
            </div>
            {!selectedCategoryId && (
              <span className={classes.activeIndicatorPip} aria-hidden="true">
                <IconCheck size={12} />
              </span>
            )}
          </button>

          {/* Individual Main Categories */}
          {mainCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = getCategoryProductCount(cat);
            const subCount = cat.children?.length || 0;

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`${classes.categoryFilterCard} ${
                  isSelected ? classes.categoryFilterCardActive : ""
                }`}
                onClick={() => handleSelectCategory(cat.id)}
              >
                <div className={classes.categoryCardThumbWrapper}>
                  <img
                    src={cat.thumbnail || "/empty.png"}
                    alt={cat.name}
                    className={classes.categoryCardThumb}
                    loading="lazy"
                  />
                </div>
                <div className={classes.categoryCardMeta}>
                  <span className={classes.categoryCardName}>{cat.name}</span>
                  <div className={classes.categoryCardBadgesRow}>
                    <span className={classes.categoryCardCount}>
                      {count.toLocaleString("fa-IR")} محصول
                    </span>
                    {subCount > 0 && (
                      <span className={classes.subCountBadge}>
                        {subCount.toLocaleString("fa-IR")} زیردسته
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <span className={classes.activeIndicatorPip} aria-hidden="true">
                    <IconCheck size={12} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subcategories Ribbon (Appears when active category has subcategories) */}
        {availableSubcategories.length > 0 && (
          <div className={classes.subCategoriesRibbon} role="region" aria-label="زیرمجموعه‌ها">
            <div className={classes.subCategoriesHeader}>
              <IconCornerDownLeft size={16} className={classes.subRibbonIcon} aria-hidden="true" />
              <span>زیرمجموعه‌های <strong>{activeMainCategory?.name}</strong>:</span>
            </div>
            <div className={classes.subCategoriesPills}>
              <button
                type="button"
                className={`${classes.subCategoryPill} ${
                  !selectedSubCategoryId ? classes.subCategoryPillActive : ""
                }`}
                onClick={() => handleSelectSubCategory(null)}
              >
                <span>همه زیرمجموعه‌ها</span>
                <span className={classes.subPillCount}>
                  {(activeMainCategory?.products?.length || 0) +
                    availableSubcategories.reduce(
                      (acc, s) => acc + (s.products?.length || 0),
                      0
                    )}
                </span>
              </button>

              {availableSubcategories.map((sub) => {
                const isSubSelected = selectedSubCategoryId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    className={`${classes.subCategoryPill} ${
                      isSubSelected ? classes.subCategoryPillActive : ""
                    }`}
                    onClick={() => handleSelectSubCategory(sub.id)}
                  >
                    <span>{sub.name}</span>
                    <span className={classes.subPillCount}>
                      {(sub.products?.length || 0).toLocaleString("fa-IR")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. RESULTS SECTION HEADER & TOOLBAR */}
      <div className={classes.sectionHeader}>
        <div className={classes.titleWrapper}>
          <h2 className={classes.sectionTitle}>
            <IconLayoutGrid size={22} />
            {activeCategoryTitle
              ? `محصولات و دسته‌بندی‌های «${activeCategoryTitle}»`
              : "تمام دسته‌بندی‌ها"}
          </h2>
          <span className={classes.categoryCountBadge}>
            {activeTab === "categories"
              ? `${filteredAndSortedCategories.length.toLocaleString("fa-IR")} دسته`
              : `${filteredAndSortedProducts.length.toLocaleString("fa-IR")} محصول`}
          </span>

          {/* Toggle Tab: Categories vs Products */}
          <div className={classes.viewModeTabs}>
            <button
              type="button"
              className={`${classes.viewModeTab} ${
                activeTab === "categories" ? classes.viewModeTabActive : ""
              }`}
              onClick={() => setActiveTab("categories")}
            >
              <IconCategory size={15} />
              دسته‌بندی‌ها
            </button>
            <button
              type="button"
              className={`${classes.viewModeTab} ${
                activeTab === "products" ? classes.viewModeTabActive : ""
              }`}
              onClick={() => setActiveTab("products")}
            >
              <IconBox size={15} />
              محصولات ({filteredAndSortedProducts.length.toLocaleString("fa-IR")})
            </button>
          </div>
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
              placeholder={
                activeTab === "categories"
                  ? "جستجو در دسته‌ها..."
                  : "جستجو در محصولات..."
              }
              className={classes.searchInput}
              aria-label="جستجو"
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
              className={`${classes.toolButton} ${
                isMenuOpen ? classes.toolButtonOpen : ""
              }`}
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
                className={`${classes.toolButtonChevron} ${
                  isMenuOpen ? classes.toolButtonChevronOpen : ""
                }`}
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
                      className={`${classes.sortMenuItem} ${
                        isSelected ? classes.sortMenuItemActive : ""
                      }`}
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

          {/* View toggle buttons (Grid vs List) for Categories */}
          {activeTab === "categories" && (
            <>
              <button
                type="button"
                className={`${classes.viewButton} ${
                  viewMode === "grid" ? classes.viewButtonActive : ""
                }`}
                onClick={() => handleViewChange("grid")}
                aria-label="نمای شبکه‌ای"
                title="نمای شبکه‌ای"
              >
                <IconLayoutGrid size={17} />
              </button>
              <button
                type="button"
                className={`${classes.viewButton} ${
                  viewMode === "list" ? classes.viewButtonActive : ""
                }`}
                onClick={() => handleViewChange("list")}
                aria-label="نمای لیستی"
                title="نمای لیستی"
              >
                <IconList size={17} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. DISPLAY AREA */}
      {activeTab === "products" ? (
        /* PRODUCTS GRID VIEW */
        filteredAndSortedProducts.length === 0 ? (
          <div className={classes.emptyState}>
            <div className={classes.emptyIcon}>
              <IconPackageOff size={44} />
            </div>
            <h3 className={classes.emptyTitle}>محصولی یافت نشد</h3>
            <p className={classes.emptyText}>
              {searchQuery
                ? `هیچ محصولی با عبارت «${searchQuery}» پیدا نشد.`
                : "محصولی در این دسته‌بندی موجود نیست."}
            </p>
            {(searchQuery || selectedCategoryId) && (
              <button
                type="button"
                onClick={() => {
                  handleClearSearch();
                  handleClearCategoryFilter();
                }}
                className={classes.resetButton}
              >
                نمایش همه محصولات
              </button>
            )}
          </div>
        ) : (
          <div className={classes.productsGrid}>
            {filteredAndSortedProducts.map((p) => {
              const hasDiscount = (p.discountPercent || 0) > 0 && p.originalPrice;
              return (
                <div key={p.id} className={classes.productCard}>
                  <div className={classes.productImageFrame}>
                    <img
                      src={p.images?.[0] || "/empty.png"}
                      alt={p.name}
                      className={classes.productImage}
                      loading="lazy"
                    />
                    <div className={classes.productBadges}>
                      {p.isSpecial && (
                        <span className={`${classes.productBadge} ${classes.badgeSpecial}`}>
                          ویژه
                        </span>
                      )}
                      {p.isBestSeller && (
                        <span className={`${classes.productBadge} ${classes.badgeBestSeller}`}>
                          پرفروش
                        </span>
                      )}
                      {p.freeShipping && (
                        <span className={`${classes.productBadge} ${classes.badgeFreeShipping}`}>
                          ارسال رایگان
                        </span>
                      )}
                      {hasDiscount && (
                        <span className={`${classes.productBadge} ${classes.badgeDiscount}`}>
                          ٪{p.discountPercent} تخفیف
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={classes.productBody}>
                    <h4 className={classes.productName} title={p.name}>
                      {p.name}
                    </h4>
                    <div className={classes.productPriceRow}>
                      <span className={classes.productPrice}>
                        {formatPrice(p.price)}
                      </span>
                      {hasDiscount && (
                        <span className={classes.productOriginalPrice}>
                          {formatPrice(Number(p.originalPrice))}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/product/${p.id}`}
                      className={classes.productDetailBtn}
                    >
                      مشاهده محصول
                      <IconArrowLeft size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : /* CATEGORIES GRID / LIST VIEW */
      filteredAndSortedCategories.length === 0 ? (
        <div className={classes.emptyState}>
          <div className={classes.emptyIcon}>
            <IconPackageOff size={44} />
          </div>
          <h3 className={classes.emptyTitle}>دسته‌بندی‌ای یافت نشد</h3>
          <p className={classes.emptyText}>
            {searchQuery
              ? `هیچ دسته‌بندی با عنوان «${searchQuery}» پیدا نشد.`
              : "دسته‌بندی فعالی با شرایط انتخاب‌شده موجود نیست."}
          </p>
          {(searchQuery || selectedCategoryId) && (
            <button
              type="button"
              onClick={() => {
                handleClearSearch();
                handleClearCategoryFilter();
              }}
              className={classes.resetButton}
            >
              نمایش همه دسته‌ها
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className={classes.categoryGrid}>
          {filteredAndSortedCategories.map((c) => {
            const minPrice = getMinPrice(c);
            const maxPrice = getMaxPrice(c);
            const bestCount = getBestSellerCount(c);

            return (
              <div key={c.id} className={classes.categoryCardWrapper}>
                <Link
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
                        {(c.products?.length || 0).toLocaleString("fa-IR")} محصول
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
                {/* Direct quick-filter button */}
                <button
                  type="button"
                  className={classes.quickFilterCardBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCategory(c.id);
                  }}
                  title={`فیلتر محصولات دسته ${c.name}`}
                >
                  فیلتر محصولات این دسته
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={classes.categoryList}>
          {filteredAndSortedCategories.map((c) => {
            const minPrice = getMinPrice(c);
            const maxPrice = getMaxPrice(c);
            const bestCount = getBestSellerCount(c);

            return (
              <div key={c.id} className={classes.categoryCardListWrapper}>
                <Link
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
                          {(c.products?.length || 0).toLocaleString("fa-IR")} محصول
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
                <button
                  type="button"
                  className={classes.quickFilterListBtn}
                  onClick={() => handleSelectCategory(c.id)}
                >
                  فیلتر محصولات
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
