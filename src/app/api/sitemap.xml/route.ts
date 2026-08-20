import {NextRequest, NextResponse} from "next/server";
import prisma from "@backend/modules/prisma/Prisma";


export async function GET(req: NextRequest, res: NextResponse) {
	const productIds = (await (prisma.product.findMany({
		select: {
			id: true
		}
	}))).map(p => p?.id);
	const categoryIds = (await (prisma.productCategory.findMany({
		select: {
			id: true
		}
	}))).map(p => p?.id);
	const defaults = ['/','/about','/contact', '/category/all']

	const baseUrl = 'https://teb-khayyer.ir';

	const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${defaults.map(id => `
      <url>
        <loc>${baseUrl}${id}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>`).join('')}
    ${productIds.map(id => `
      <url>
        <loc>${baseUrl}/product/${id}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>`).join('')}
       ${categoryIds.map(id => `
      <url>
        <loc>${baseUrl}/category/${id}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>`).join('')}
  </urlset>`;

	return new Response(sitemapContent, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
