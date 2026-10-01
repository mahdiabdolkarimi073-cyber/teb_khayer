import React from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({data}: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teb-khayyer.ir";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "طب خیّر",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    sameAs: [
      "https://www.instagram.com/hejamat_ardabil",
      "https://t.me/Teb_khayyer_Ardabil",
      "https://eitaa.com/joinchat/2771714572C9cc8f60c1b",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "طب خیّر",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/category/all?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: {
  name: string;
  description_text: string;
  images: string[];
  price: number;
  stock: number;
  id: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description_text || product.name,
    image: product.images?.length ? product.images.map((img) => img.startsWith("http") ? img : `${SITE_URL}${img}`) : [`${SITE_URL}/logo.webp`],
    sku: product.id,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "IRR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.id}`,
    },
  };
}

export function breadcrumbJsonLd(items: {name: string; url: string}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
