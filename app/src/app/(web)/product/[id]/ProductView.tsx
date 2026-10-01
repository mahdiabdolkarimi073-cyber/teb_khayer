"use client";

import {Product, ProductCategory} from "@prisma/client";
import React, {useMemo, useState} from "react";
import {IconArrowLeft, IconBuildingStore, IconCheck, IconChevronLeft, IconHeart, IconInfoCircle, IconRefresh, IconShare, IconShieldCheck, IconShoppingCart, IconTruckDelivery} from "@tabler/icons-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import ProductCard from "@/app/(web)/ProductCard";
import {modal} from "@/utils/modal";
import HowCanITrust from "@/app/(web)/product/[id]/HowCanITrust";
import ProductImageGallery from "@/components/shop/ProductImageGallery";
import {setLocalCart, useCart} from "@/utils/localCart";
import classes from "./product-view.module.css";

const ProductView = (props: {
  product: Product & {category?: ProductCategory & {products?: Product[]}},
  saleEnabled?: boolean
}) => {
  const {product, saleEnabled = true} = props;
  const {categoryId, images, name, price, originalPrice, discountPercent, isSpecial, isBestSeller, properties, stock} = product;
  const cart = useCart();
  const router = useRouter();
  const productCart = cart[product.id];
  const [quantity, setQuantity] = useState(productCart?.quantity || 1);
  const [activeTab, setActiveTab] = useState(0);
  const available = saleEnabled && stock > 0;
  const hasDiscount = Number(discountPercent || 0) > 0 && Boolean(originalPrice);
  const related = product.category?.products?.filter((item) => item.id !== product.id) || [];
  const parsedProperties = useMemo(() => properties?.split("\n").map((line) => {
    const [label, ...rest] = line.split(":");
    return {label: label?.trim(), value: rest.join(":").trim()};
  }).filter((item) => item.label), [properties]);

  const updateCart = (nextQuantity: number) => {
    const safeQuantity = Math.max(1, Math.min(nextQuantity, stock || 1));
    setQuantity(safeQuantity);
    setLocalCart(product, safeQuantity);
  };

  const showTrustModal = () => modal("ضمانت اصالت و اعتماد", <HowCanITrust product={product}/>);
  const tabs = ["توضیحات محصول", "مشخصات فنی", "نظرات کاربران", "سوالات متداول"];

  return (
    <main className={classes.page}>
      <div className={classes.breadcrumbBar}>
        <div className={classes.breadcrumbInner}>
          <Link href="/">خانه</Link><IconChevronLeft size={14}/>
          <Link href={`/category/${categoryId}`}>{product.category?.name || "محصولات"}</Link><IconChevronLeft size={14}/>
          <span>{name}</span>
        </div>
      </div>

      <section className={classes.productShell}>
        <div className={classes.galleryColumn}>
          <div className={classes.galleryCard}>
            <div className={classes.galleryBadges}>
              {isSpecial && <span className={classes.bSpecial}>محصول ویژه</span>}
              {isBestSeller && <span className={classes.bBest}>پرفروش</span>}
              {hasDiscount && <span className={classes.bDisc}>٪{Number(discountPercent).toLocaleString("fa")} تخفیف</span>}
            </div>
            <ProductImageGallery images={images || []} alt={name}/>
          </div>
          <div className={classes.galleryActions}>
            <button type="button" aria-label="افزودن به علاقه‌مندی‌ها"><IconHeart size={18}/>افزودن به علاقه‌مندی‌ها</button>
            <button type="button" aria-label="اشتراک‌گذاری"><IconShare size={18}/>اشتراک‌گذاری</button>
          </div>
        </div>

        <div className={classes.infoColumn}>
          <div className={classes.productHeading}>
            <h1>{name}</h1>
            <div className={classes.ratingRow}>
              <span className={classes.stars}>★★★★★</span>
              <span>۴.۹</span>
              <span className={classes.dot}/>
              <span className={classes.reviewLink}>۲۴ نظر</span>
            </div>
            <span className={available ? `${classes.statusPill} ${classes.available}` : `${classes.statusPill} ${classes.unavailable}`}>
              <i/> {available ? "موجود در انبار" : "ناموجود"}
            </span>
          </div>

          <div className={classes.priceCard}>
            <div className={classes.priceMain}>
              <strong>{price.toLocaleString("fa")}</strong>
              <span>تومان</span>
              {hasDiscount && <span className={classes.priceOld}>{Number(originalPrice).toLocaleString("fa")}</span>}
            </div>
            {hasDiscount && <span className={classes.priceDiscount}>٪{Number(discountPercent).toLocaleString("fa")} تخفیف</span>}
          </div>

          <div className={classes.buyCard}>
            <div className={classes.quantityRow}>
              <span className={classes.label}>تعداد:</span>
              <div className={classes.quantity}>
                <button type="button" onClick={() => updateCart(quantity + 1)} disabled={!available || quantity >= stock}>+</button>
                <span>{quantity.toLocaleString("fa")}</span>
                <button type="button" onClick={() => updateCart(quantity - 1)} disabled={!available || quantity <= 1}>−</button>
              </div>
              {available && <span className={classes.stockHint}>{Number(stock).toLocaleString("fa")} عدد در انبار</span>}
            </div>
            <button type="button" className={classes.addButton} disabled={!available} onClick={() => { updateCart(quantity); router.push("/dashboard/cart"); }}>
              <IconShoppingCart size={22}/>{available ? "افزودن به سبد خرید" : "ناموجود"}
            </button>
          </div>

          <div className={classes.serviceRow}>
            <span><IconTruckDelivery size={22}/><b>ارسال سریع</b><small>به سراسر کشور</small></span>
            <span><IconRefresh size={22}/><b>ضمانت بازگشت</b><small>۷ روز مهلت بازگشت</small></span>
            <span><IconShieldCheck size={22}/><b>خرید مطمئن</b><small>پرداخت امن و معتبر</small></span>
          </div>

          <button type="button" className={classes.trustBanner} onClick={showTrustModal}>
            <IconShieldCheck size={28}/><span><b>ضمانت اصالت کالا</b><small>همراه با گواهی اصالت و ضمانت بازگشت</small></span><IconArrowLeft size={18}/>
          </button>
        </div>

        <aside className={classes.sideColumn}>
          <div className={classes.sideCard}>
            <h3><IconCheck size={18}/>ویژگی‌های محصول</h3>
            {parsedProperties.length ? parsedProperties.map((item, index) => (
              <div className={classes.feature} key={`${item.label}-${index}`}>
                <span className={classes.featureIcon}><IconCheck size={16}/></span>
                <span><small>{item.label}</small><b>{item.value || "با کیفیت ممتاز"}</b></span>
              </div>
            )) : <div className={classes.emptyFeature}><IconInfoCircle size={18}/>ویژگی‌ای ثبت نشده است.</div>}
          </div>

          <div className={classes.sideCard}>
            <h3><IconBuildingStore size={18}/>اطلاعات فروشنده</h3>
            <div className={classes.sellerRow}>
              <span className={classes.sellerIcon}><IconBuildingStore size={16}/></span>
              <span><small>فروشگاه</small><b>طب خیّر</b></span>
            </div>
            <div className={classes.sellerRow}>
              <span className={classes.sellerIcon}><IconShieldCheck size={16}/></span>
              <span><small>امتیاز فروشنده</small><b>۴.۹ از ۵</b></span>
            </div>
            <div className={classes.sellerRow}>
              <span className={classes.sellerIcon}><IconTruckDelivery size={16}/></span>
              <span><small>آماده ارسال</small><b>در کمترین زمان</b></span>
            </div>
            <button type="button" className={classes.trustLink} onClick={showTrustModal}>چطور به این فروشگاه اعتماد کنم؟ <IconArrowLeft size={16}/></button>
          </div>
        </aside>
      </section>

      <section className={classes.detailsSection}>
        <div className={classes.detailsCard}>
          <div className={classes.tabs}>
            {tabs.map((tab, index) => (
              <button key={tab} type="button" className={activeTab === index ? classes.activeTab : ""} onClick={() => setActiveTab(index)}>{tab}</button>
            ))}
          </div>
          <div className={classes.detailsContent}>
            <div className={classes.detailsText}>
              <h3>معرفی محصول</h3>
              <div dangerouslySetInnerHTML={{__html: product.description}}/>
              <ul>
                <li><IconCheck size={16}/>کیفیت و اصالت تضمین‌شده</li>
                <li><IconCheck size={16}/>بسته‌بندی ایمن و ارسال سریع</li>
                <li><IconCheck size={16}/>مناسب برای استفاده روزمره</li>
              </ul>
            </div>
            <div className={classes.detailsQuote}>
              <IconShieldCheck size={36}/>
              <h3>اصالت، هنر ماندگار</h3>
              <p>انتخابی مطمئن برای کسانی که کیفیت و زیبایی را هم‌زمان می‌خواهند.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={classes.relatedSection}>
        <div className={classes.sectionTitle}>
          <h2>محصولات مشابه</h2>
          <Link href={`/category/${categoryId}`}>مشاهده همه <IconArrowLeft size={16}/></Link>
        </div>
        {related.length ? <div className={classes.relatedGrid}>{related.map((item) => <ProductCard key={item.id} product={item}/>)}</div> : <div className={classes.relatedEmpty}><IconInfoCircle size={20}/>محصول مشابهی یافت نشد.</div>}
      </section>
    </main>
  );
};

export default ProductView;
