import type { Metadata } from "next";
import EncargosPageClient from "./EncargosPageClient";

export const metadata: Metadata = {
  title: "Encargos personalizados",
  description:
    "Gestiona tus encargos personalizados, define presupuestos y genera links de pago cuando corresponda.",
  alternates: {
    canonical: "/encargos",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function EncargosPage() {
  return <EncargosPageClient />;
}
