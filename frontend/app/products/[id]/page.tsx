import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';
import type { Product } from '@/types/products';

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/+$/, '');
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribaltrend.com.ar').replace(/\/+$/, '');

type ProductPageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

const getProduct = async (id: number): Promise<Product | null> => {
  try {
    const response = await fetch(`${apiUrl}/productos/${id}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json() as Promise<Product>;
  } catch {
    return null;
  }
};

const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const compactDescription = (product: Product) => {
  const text = String(product.descripcion ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return (text || `${product.nombre}, una pieza de joyería artesanal de Tribal Trend hecha en Argentina.`)
    .slice(0, 155);
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const productId = Number.parseInt(id, 10);
  if (!Number.isInteger(productId) || productId < 1) return {};
  const product = await getProduct(productId);
  if (!product) return { title: 'Producto no encontrado' };

  const category = product.subcategoria?.nombre || product.categoria?.nombre || 'Joyería artesanal';
  const title = `${product.nombre} | ${category} artesanal`;
  const description = compactDescription(product);
  const image = toAbsoluteUrl(product.fotos?.[0]?.url ?? product.disenos?.[0]?.url_foto);

  return {
    title,
    description,
    keywords: [
      product.nombre,
      category,
      `${category} artesanal`,
      'joyería artesanal',
      'bijouterie argentina',
      'Tribal Trend',
    ],
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title: `${title} | Tribal Trend`,
      description,
      url: `/products/${product.id}`,
      type: 'website',
      images: image ? [{ url: image, alt: `${product.nombre} artesanal` }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await Promise.resolve(params);
  const productId = Number.parseInt(id, 10);
  if (!Number.isInteger(productId) || productId < 1) notFound();

  const product = await getProduct(productId);
  if (!product || !product.es_activo) notFound();

  const price = Number(product.precio_final ?? product.precio);
  const images = [
    ...(product.fotos ?? []).map((photo) => toAbsoluteUrl(photo.url)),
    ...(product.disenos ?? []).map((design) => toAbsoluteUrl(design.url_foto)),
  ].filter((url): url is string => Boolean(url));
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    image: images,
    description: compactDescription(product),
    sku: String(product.id),
    category: product.subcategoria?.nombre ?? product.categoria?.nombre,
    brand: { '@type': 'Brand', name: 'Tribal Trend' },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.id}`,
      priceCurrency: 'ARS',
      price: price.toFixed(2),
      itemCondition: 'https://schema.org/NewCondition',
      availability: Number(product.stock) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ProductPageClient productId={productId} />
    </>
  );
}
