import prisma from "@backend/modules/prisma/Prisma";
import {
  IconSparkles,
  IconLayoutGrid,
  IconAdjustmentsHorizontal,
  IconArrowLeft,
  IconCategory,
  IconChevronLeft,
} from "@tabler/icons-react";
import Link from "next/link";
import classes from "./category-list.module.css";
import React from "react";

const HERO_IMAGE = "/ChatGPT_Image_Sep_19,_2026,_11_41_28_AM.png";

const Page = async (props: any) => {
  let categories = await prisma.productCategory.findMany({
    include: {
      products: true,
    },
  });

  categories = categories.filter((c) => c.products?.length > 0);

  return (
    <div className={classes.page}>
      <div className={classes.shell}>
        <section className={classes.hero}>
          <img
            src={HERO_IMAGE}
            alt="دسته‌بندی محصولات طب خیر"
            className={classes.heroImage}
          />
          <div className={classes.heroShade} />
          <div className={classes.heroContent}>
            <span className={classes.kicker}>
              <IconSparkles size="14" />
              فروشگاه طب خیر
            </span>
            <h1 className={classes.heroTitle}>دسته‌بندی محصولات</h1>
            <p className={classes.heroDescription}>
              محصولات دست‌ساز و گیاهی ما را دسته‌بندی شده مرور کنید و با چند کلیک به
              محصول دلخواهتان برسید.
            </p>
            <div className={classes.heroActions}>
              <Link href="/category/all" className={classes.primaryAction}>
                مشاهده فروشگاه
                <IconArrowLeft size="16" />
              </Link>
              <Link href="/contact" className={classes.secondaryAction}>
                مشاوره خرید
              </Link>
            </div>
          </div>
          <div className={classes.heroBenefits}>
            <span className={classes.benefit}>
              <IconCategory size="16" className={classes.benefitIcon} />
              {categories.length} دسته
            </span>
            <span className={classes.benefit}>
              <IconLayoutGrid size="16" className={classes.benefitIcon} />
              ارسال سریع
            </span>
          </div>
        </section>

        <div className={classes.sectionHeader}>
          <h2 className={classes.sectionTitle}>
            <IconLayoutGrid size="22" />
            تمام دسته‌بندی‌ها
          </h2>
          <div className={classes.toolbar}>
            <button type="button" className={classes.toolButton}>
              <IconAdjustmentsHorizontal size="16" />
              مرتب‌سازی
            </button>
            <button
              type="button"
              className={`${classes.viewButton} ${classes.viewButtonActive}`}
              aria-label="نمای شبکه‌ای"
            >
              <IconLayoutGrid size="16" />
            </button>
            <button
              type="button"
              className={classes.viewButton}
              aria-label="نمای لیستی"
            >
              <IconAdjustmentsHorizontal size="16" />
            </button>
          </div>
        </div>

        <div className={classes.categoryGrid}>
          {categories.map((c) => (
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
                />
                <div className={classes.imageWash} />
                <div className={classes.cardBadge}>
                  <IconCategory size="15" />
                </div>
              </div>
              <div className={classes.cardBody}>
                <div className={classes.cardText}>
                  <h3 className={classes.cardTitle}>{c.name}</h3>
                  <p className={classes.cardCount}>
                    {c.products?.length || 0} محصول
                  </p>
                </div>
                <span className={classes.cardArrow}>
                  <IconChevronLeft size="15" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
