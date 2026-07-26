import type { MetadataRoute } from 'next';
import type { PaginatedProductsResponse } from '@/types/products';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribaltrend.com.ar').replace(/\/+$/, '');
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/+$/, '');

const getProductIds = async (): Promise<number[]> => {
  try {
    const firstResponse = await fetch(`${apiUrl}/productos?page=1`, { cache: 'no-store' });
    if (!firstResponse.ok) return [];
    const firstPage = await firstResponse.json() as PaginatedProductsResponse;
    const pages = await Promise.all(
      Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
        fetch(`${apiUrl}/productos?page=${index + 2}`, { cache: 'no-store' })
          .then((response) => response.ok ? response.json() as Promise<PaginatedProductsResponse> : null)
          .catch(() => null),
      ),
    );
    return [firstPage, ...pages.filter((page): page is PaginatedProductsResponse => Boolean(page))]
      .flatMap((page) => page.data)
      .filter((product) => product.es_activo)
      .map((product) => product.id);
  } catch {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const productIds = await getProductIds();

  return [
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...productIds.map((id) => ({
      url: `${siteUrl}/products/${id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
