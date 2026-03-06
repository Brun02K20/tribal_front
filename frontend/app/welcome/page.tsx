import type { Metadata } from "next";
import WelcomePageClient from "./WelcomePageClient";

export const metadata: Metadata = {
  title: "Bienvenido",
  description: "Panel de bienvenida de usuario autenticado.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/welcome",
  },
};

export default function WelcomePage() {
  return <WelcomePageClient />;
}

