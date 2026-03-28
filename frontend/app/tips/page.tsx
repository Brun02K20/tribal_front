import type { Metadata } from "next";
import TipsContent from "./tips";

export const metadata: Metadata = {
  title: "Tips artesanales",
  description:
    "Guia con recomendaciones para comprar artesanias, incluyendo como saber tu numero de anillo.",
  alternates: {
    canonical: "/tips",
  },
  keywords: [
    "tips artesanales",
    "numero de anillo",
    "guia de compra",
    "artesanias",
    "Tribal Trend",
  ],
  openGraph: {
    title: "Tips artesanales | Tribal Trend",
    description:
      "Aprende tips utiles para comprar mejor, incluyendo como medir tu dedo y saber tu numero de anillo.",
    url: "/tips",
    type: "article",
  },
};

export default function TipsPage() {
  return <TipsContent />;
}
