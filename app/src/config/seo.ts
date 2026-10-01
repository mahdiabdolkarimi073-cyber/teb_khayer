import type {Metadata} from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teb-khayyer.ir";

export const siteConfig = {
  url: SITE_URL,
  name: "طب خیّر",
  description: "گروه طب خیّر با هدف آموزش جامع طب سنتی و طب ایرانی اسلامی و طب چینی، دوره‌های تخصصی و فروشگاه گیاهان دارویی",
  keywords: ["طب سنتی", "طب ایرانی", "طب چینی", "گیاهان دارویی", "حجامت", "سونوگرافی", "ویزیت آنلاین", "طب خیّر"],
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {default: siteConfig.name, template: `%s | ${siteConfig.name}`},
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{name: siteConfig.name}],
  robots: {index: true, follow: true},
  alternates: {canonical: SITE_URL, languages: {"fa-IR": SITE_URL}},
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{url: "/logo.webp", width: 512, height: 512, alt: siteConfig.name}],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/logo.webp"],
  },
  icons: {icon: "/logo.webp", apple: "/logo.webp"},
  manifest: "/manifest.json",
};

export function productMetadata(product: {name: string; description_text: string; images: string[]; price: number; stock: number; id: string}): Metadata {
  const image = product.images?.[0] || "/logo.webp";
  return {
    title: product.name,
    description: product.description_text || product.name,
    keywords: product.name.split(" "),
    alternates: {canonical: `${SITE_URL}/product/${product.id}`},
    openGraph: {
      type: "website",
      locale: "fa_IR",
      url: `${SITE_URL}/product/${product.id}`,
      title: product.name,
      description: product.description_text || product.name,
      images: [{url: image, alt: product.name}],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description_text || product.name,
      images: [image],
    },
  };
}

export function categoryMetadata(category: {name: string; id: string}): Metadata {
  return {
    title: category.name,
    description: `محصولات دسته ${category.name}`,
    keywords: category.name.split(" "),
    alternates: {canonical: `${SITE_URL}/category/${category.id}`},
    openGraph: {
      type: "website",
      locale: "fa_IR",
      url: `${SITE_URL}/category/${category.id}`,
      title: category.name,
      description: `محصولات دسته ${category.name}`,
    },
  };
}
