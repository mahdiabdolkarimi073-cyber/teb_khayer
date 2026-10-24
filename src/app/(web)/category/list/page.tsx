import prisma from "@backend/modules/prisma/Prisma";
import {
  IconSparkles,
  IconLayoutGrid,
  IconArrowLeft,
  IconCategory,
} from "@tabler/icons-react";
import Link from "next/link";
import classes from "./category-list.module.css";
import React from "react";
import CategoryListView, { ViewMode } from "./CategoryListView";

const HERO_IMAGE = "/ChatGPT_Image_Sep_19,_2026,_11_41_28_AM.png";

interface PageProps {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

const Page = async (props: PageProps) => {
  const resolvedSearchParams = props.searchParams
    ? await Promise.resolve(props.searchParams)
    : {};
  const initialSort =
    typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : "default";
  const initialSearch =
    typeof resolvedSearchParams.q === "string"
      ? resolvedSearchParams.q
      : typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : "";
  const initialView: ViewMode =
    resolvedSearchParams.view === "list" ? "list" : "grid";

  const rawCategories = await prisma.productCategory.findMany({
    include: {
      products: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  const categories = rawCategories.filter((c) => c.products?.length > 0);

  // Serialize Date objects safely across client component boundary
  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    thumbnail: c.thumbnail,
    created_at:
      c.created_at instanceof Date
        ? c.created_at.toISOString()
        : String(c.created_at || ""),
    parentId: c.parentId,
    products: (c.products || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      discountPercent: Number(p.discountPercent) || 0,
      isBestSeller: Boolean(p.isBestSeller),
      isSpecial: Boolean(p.isSpecial),
      created_at:
        p.created_at instanceof Date
          ? p.created_at.toISOString()
          : String(p.created_at || ""),
    })),
  }));

  return (
    <div className={classes.page}>
      <div className={classes.shell}>
        <section className={classes.hero}>
          <img
            src={HERO_IMAGE}
            alt="دسته‌بندی محصولات طِب خیّر"
            className={classes.heroImage}
          />
          <div className={classes.heroShade} />
          <div className={classes.heroContent}>
            <span className={classes.kicker}>
              <IconSparkles size="14" />
              فروشگاه طِب خیّر
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

        <CategoryListView
          categories={serializedCategories}
          initialSort={initialSort}
          initialView={initialView}
          initialSearch={initialSearch}
        />
      </div>
    </div>
  );
};

export default Page;
