import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";

export const metadata: Metadata = {
  title: "Detalle de producto | Tribal Trend",
  description: "Conoce los detalles del producto en nuestra tienda de arte, decoraciones y artesanias.",
  keywords: ["arte", "decoraciones", "artesanias", "tienda de artesanias", "cordoba", "argentina"],
  alternates: {
    canonical: "/products",
  },
};

type ProductPageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const productId = Number.parseInt(String(resolvedParams?.id ?? ""), 10);

  if (!Number.isFinite(productId) || productId < 1) {
    notFound();
  }

  return <ProductPageClient productId={productId} />;
}

