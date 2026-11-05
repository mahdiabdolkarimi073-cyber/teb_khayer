"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import { getVar, setVar } from "@backend/utils/setting";

async function requireAdmin() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
}

export interface SeoMeta {
  path: string;
  title: string;
  description: string;
  keywords: string;
}

const STATIC_PAGES = [
  {path: "/", title: "طب خیّر", description: "آموزش جامع طب سنتی و فروشگاه گیاهان دارویی", keywords: "طب سنتی, طب ایرانی, گیاهان دارویی"},
  {path: "/about", title: "درباره ما", description: "گروه طب خیّر و اهداف آن", keywords: "طب خیّر, درباره ما"},
  {path: "/contact", title: "تماس با ما", description: "راه‌های ارتباطی طب خیّر", keywords: "تماس, پشتیبانی"},
  {path: "/category/all", title: "همه محصولات", description: "لیست کامل محصولات فروشگاه", keywords: "محصولات, فروشگاه"},
  {path: "/category/list", title: "دسته‌بندی‌ها", description: "دسته‌بندی محصولات", keywords: "دسته‌بندی"},
];

export async function getSeoPages(): Promise<SeoMeta[]> {
  await requireAdmin();
  let seoMap: Record<string, SeoMeta> = {};
  try {
    const raw = await getVar<string>("SEO_PAGE_META", "{}");
    seoMap = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
  } catch {
    seoMap = {};
  }

  return STATIC_PAGES.map((page) => {
    const stored = seoMap[page.path];
    if (stored) {
      return {
        path: page.path,
        title: stored.title || page.title,
        description: stored.description || page.description,
        keywords: stored.keywords || page.keywords,
      };
    }
    return page;
  });
}

export async function saveSeoPage(meta: SeoMeta): Promise<void> {
  await requireAdmin();
  let seoMap: Record<string, SeoMeta> = {};
  try {
    const raw = await getVar<string>("SEO_PAGE_META", "{}");
    seoMap = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
  } catch {
    seoMap = {};
  }
  seoMap[meta.path] = meta;
  await setVar("SEO_PAGE_META", JSON.stringify(seoMap));
}

export async function getPagesWithoutMetadata() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    select: {id: true, name: true, description_text: true},
    take: 100,
  });
  const categories = await prisma.productCategory.findMany({
    select: {id: true, name: true},
  });

  const missingProducts = products.filter((p) => !p.description_text || p.description_text.trim() === "").map((p) => ({type: "محصول", id: p.id, name: p.name}));
  const missingCategories = categories.filter((c) => !c.name || c.name.trim() === "").map((c) => ({type: "دسته", id: c.id, name: c.name || "بدون نام"}));

  return [...missingProducts, ...missingCategories];
}
