import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Iniciar sesion",
  description: "Inicia sesion en Tribal Trend para comprar artesanias y gestionar tus pedidos.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}

