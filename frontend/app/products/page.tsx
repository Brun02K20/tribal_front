import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "Arte, decoraciones y artesanias online",
  description:
    "Explora arte, decoraciones y artesanias en nuestra tienda online. Compra en Cordoba y toda Argentina con envios y atencion personalizada.",
  alternates: {
    canonical: "/products",
  },
  keywords: [
    "arte",
    "decoraciones",
    "artesanias",
    "tienda de artesanias",
    "tienda de arte",
    "regalos artesanales",
    "cordoba",
    "argentina",
  ],
  openGraph: {
    title: "Arte, decoraciones y artesanias online | Tribal Trend",
    description:
      "Descubre arte, decoraciones y artesanias con envios en Cordoba y toda Argentina.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}

