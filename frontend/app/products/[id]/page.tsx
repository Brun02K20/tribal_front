import type { Metadata } from "next";
import ProductPageClient from "./ProductPageClient";

export const metadata: Metadata = {
  title: "Detalle de producto | Tribal Trend",
  description: "Conoce los detalles del producto en nuestra tienda de arte, decoraciones y artesanias.",
  keywords: ["arte", "decoraciones", "artesanias", "tienda de artesanias", "cordoba", "argentina"],
  alternates: {
    canonical: "/products",
  },
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = Number(params.id);
  return <ProductPageClient productId={productId} />;
}

