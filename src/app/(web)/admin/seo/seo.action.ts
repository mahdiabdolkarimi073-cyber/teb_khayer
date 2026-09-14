"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";

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
  const settings = await prisma.setting.findMany();
  const seoSettings = settings.filter((s) => s.key.toString().startsWith("SEO_"));

  return STATIC_PAGES.map((page) => {
    const stored = seoSettings.find((s) => s.key.toString() === `SEO_${page.path}`);
    if (stored) {
      const parts = stored.value.split("|||");
      return {path: page.path, title: parts[0] || page.title, description: parts[1] || page.description, keywords: parts[2] || page.keywords};
    }
    return page;
  });
}

export async function saveSeoPage(meta: SeoMeta): Promise<void> {
  await requireAdmin();
  const key = `SEO_${meta.path}` as any;
  const value = `${meta.title}|||${meta.description}|||${meta.keywords}`;
  const existing = await prisma.setting.findUnique({where: {key}});
  if (existing) {
    await prisma.setting.update({where: {key}, data: {value}});
  } else {
    await prisma.setting.create({data: {key, value}});
  }
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
