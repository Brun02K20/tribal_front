import type { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta en Tribal Trend para comprar artesanias online y seguir tus pedidos.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}

