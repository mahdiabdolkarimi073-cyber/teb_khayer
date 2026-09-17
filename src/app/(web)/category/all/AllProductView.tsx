'use client';

import {Product} from "@prisma/client";
import React, {useEffect, useState} from "react";
import {useAction} from "@/utils/server";
import {getAllProductCount, getProducts, SortOption} from "@/app/(web)/category/all/action";
import {Pagination, TextInput} from "@mantine/core";
import Loading from "@/app/(app)/loading";
import {useDebouncedState} from "@mantine/hooks";
import Link from "next/link";
import ProductLike from "@/components/shop/ProductLike";
import {IconCategory, IconGrid4x4, IconList, IconShoppingCart, IconSparkles, IconStar, IconFlame, IconPercentage, IconAward} from "@tabler/icons-react";
import styles from "./all-products.module.css";

const categories = ["همه محصولات", "محصولات سلامت", "گیاهان دارویی", "مواد غذایی و خوراکی", "پوشاک و اکسسوری", "کتاب و لوازم فرهنگی", "لوازم دیجیتال", "زیبایی و سلامت", "ورزش و سفر"];

const filterTabs: { label: string; value: SortOption; icon: any }[] = [
  { label: "جدیدترین", value: "new", icon: IconSparkles },
  { label: "پرفروش‌ترین", value: "bestSeller", icon: IconFlame },
  { label: "تخفیف‌دار", value: "discount", icon: IconPercentage },
  { label: "ویژه", value: "special", icon: IconAward },
  { label: "ارزان‌ترین", value: "priceLow", icon: IconStar },
  { label: "گران‌ترین", value: "priceHigh", icon: IconStar },
];

const AllProductView = (props: { products: Product[]; count: number; search?: string; sort?: SortOption; saleEnabled?: boolean; id?: string }) => {
  const MAX = 20;
  const [search, setSearch] = useState(props.search || "");
  const [tempSearch, setTempSearch] = useDebouncedState(props.search || "", 500);
  const [skip, setSkip] = useState(0);
  const [sort, setSort] = useState<SortOption>(props.sort || "new");
  const [products, setProducts] = useState<Product[]>(props.products);
  const {result: nCount, isPending} = useAction(getAllProductCount, search, sort);
  const {result: newProducts, isPending: isLoading} = useAction(getProducts, skip, search, MAX, sort);
  const [count, setCount] = useState(props.count);

  useEffect(() => { if (nCount !== undefined) setCount(nCount); }, [nCount]);
  useEffect(() => { if (newProducts) { window.scrollTo({top: 0, behavior: "smooth"}); setProducts(newProducts); } }, [newProducts]);
  useEffect(() => { setSearch(tempSearch); setSkip(0); }, [tempSearch]);
  useEffect(() => { setSkip(0); }, [sort]);

  const pagination = (
    <div className={styles.pagination}>
      <Pagination total={Math.max(Math.ceil(count / MAX), 1)} value={Math.max(Math.floor(skip / MAX) + 1, 1)} onChange={(page) => setSkip((page - 1) * MAX)} />
    </div>
  );

  return (
    <section className={styles.shell} id={props.id}>
      <aside className={styles.sidebar} id="categories">
        <h2 className={styles.sidebarTitle}><IconCategory size={20} /> دسته‌بندی‌ها</h2>
        {categories.map((category, index) => <button className={`${styles.categoryButton} ${index === 0 ? styles.categoryActive : ""}`} key={category} type="button">{index === 0 ? <IconSparkles size={17} /> : <IconCategory size={17} />}{category}</button>)}
        <div className={styles.promo}>
          <img className={styles.promoImage} src="/ChatGPT_Image_Sep_14,_2026,_11_49_32_AM.png" alt="محصولات سلامت طب خیر" />
          <div className={styles.promoContent}><div className={styles.promoTitle}>پیشنهاد ویژه طب خیر</div><p className={styles.promoText}>انتخابی مطمئن برای سلامت شما</p><Link className={styles.promoButton} href="#products">مشاهده محصولات</Link></div>
        </div>
      </aside>

      <div className={styles.catalog}>
        <div className={styles.catalogHeader}>
          <div><h1 className={styles.catalogHeading}>همه محصولات</h1><p className={styles.catalogCount}>{isPending ? "در حال بررسی..." : `${count.toLocaleString("fa-IR")} محصول موجود است`}</p></div>
          <div className={styles.tools}><span className={styles.view}><IconGrid4x4 size={18} /></span><span className={styles.view}><IconList size={18} /></span></div>
        </div>

        <div className={styles.filterTabs}>
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.value} className={`${styles.filterTab} ${sort === tab.value ? styles.filterTabActive : ""}`} type="button" onClick={() => setSort(tab.value)}>
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className={styles.search}><TextInput placeholder="جستجو در محصولات، نام محصول یا توضیحات..." defaultValue={tempSearch} onChange={(event) => setTempSearch(event.currentTarget.value)} /></div>
        {pagination}
        {skip !== 0 && isLoading ? <Loading /> : <div className={styles.products}>
          {products.map((product) => {
            const outOfStock = props.saleEnabled === false || !product.stock || product.stock <= 0;
            const hasDiscount = (product.discountPercent || 0) > 0;
            return <article className={styles.productCard} key={product.id}>
              <div className={styles.badgeRow}>
                {product.isSpecial && <span className={`${styles.badge} ${styles.badgeSpecial}`}>ویژه</span>}
                {product.isBestSeller && <span className={`${styles.badge} ${styles.badgeBestSeller}`}>پرفروش</span>}
                {hasDiscount && <span className={`${styles.badge} ${styles.badgeDiscount}`}>٪{product.discountPercent.toLocaleString("fa-IR")} تخفیف</span>}
                {outOfStock && <span className={`${styles.badge} ${styles.badgeOutOfStock}`}>ناموجود</span>}
              </div>
              <Link href={`/product/${product.id}`}><img className={styles.productImage} src={product.images?.[0] || "/empty.png"} alt={product.name} loading="lazy" /></Link>
              <div className={styles.productBody}>
                <div className={styles.productName}>{product.name}</div>
                <p className={styles.productDescription}>{product.description_text || "محصول باکیفیت از مجموعه طب خیر"}</p>
                <div className={styles.priceRow}>
                  {hasDiscount && product.originalPrice ? (
                    <>
                      <span className={styles.productOldPrice}>{product.originalPrice.toLocaleString("fa-IR")}</span>
                      <span className={styles.productPrice}>{product.price.toLocaleString("fa-IR")} تومان</span>
                    </>
                  ) : (
                    <span className={styles.productPrice}>{product.price.toLocaleString("fa-IR")} تومان</span>
                  )}
                </div>
                <div className={styles.productFooter}>
                  <Link className={styles.productLink} href={`/product/${product.id}`}><IconShoppingCart size={15} />{outOfStock ? "مشاهده محصول" : "افزودن به سبد"}</Link>
                  <ProductLike id={product.id} />
                </div>
              </div>
            </article>;
          })}
        </div>}
        {pagination}
      </div>
    </section>
  );
};

export default AllProductView;
