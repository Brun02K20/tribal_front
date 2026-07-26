import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "Joyería artesanal: collares, anillos y pulseras",
  description:
    "Descubrí collares, anillos, pulseras y bijouterie artesanal de Tribal Trend. Piezas únicas hechas a mano en Argentina con envíos a todo el país.",
  alternates: {
    canonical: "/products",
  },
  keywords: [
    "joyería artesanal",
    "bijouterie artesanal",
    "bijou argentina",
    "collares artesanales",
    "anillos artesanales",
    "pulseras artesanales",
    "accesorios artesanales",
    "regalos artesanales",
    "joyería argentina",
    "Tribal Trend",
  ],
  openGraph: {
    title: "Joyería artesanal: collares, anillos y pulseras | Tribal Trend",
    description:
      "Piezas únicas de joyería y bijouterie artesanal hechas a mano en Argentina.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}

