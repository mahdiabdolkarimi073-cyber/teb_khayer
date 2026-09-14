import type {MetadataRoute} from "next";
import prisma from "@backend/modules/prisma/Prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teb-khayyer.ir";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1},
    {url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6},
    {url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6},
    {url: `${SITE_URL}/category/all`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8},
    {url: `${SITE_URL}/category/list`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7},
  ];

  const [products, categories, courses] = await Promise.all([
    prisma.product.findMany({select: {id: true, updated_at: true}}),
    prisma.productCategory.findMany({select: {id: true, created_at: true}}),
    prisma.course.findMany({select: {id: true, updated_at: true}}),
  ]);

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.id}`,
    lastModified: c.created_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
