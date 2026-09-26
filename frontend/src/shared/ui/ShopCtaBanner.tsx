import Link from "next/link";
import { IconArrowRight } from "@/shared/ui/Icons";

type ShopCtaBannerProps = {
  kicker?: string;
  title?: string;
  text?: string;
  className?: string;
};

// Banner de campaña reutilizable para llevar a la tienda desde contenido editorial.
export default function ShopCtaBanner({
  kicker = "Hecho a mano para vos",
  title = "Encontrá la pieza que te representa",
  text = "Collares, pulseras, anillos y aros únicos, con piedras naturales. Cuando se van, no vuelven.",
  className = "",
}: ShopCtaBannerProps) {
  return (
    <section className={`app-campaign p-7 sm:p-10 ${className}`}>
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="app-kicker">{kicker}</p>
          <h2 className="app-display mt-2 text-3xl md:text-4xl">{title}</h2>
          <p className="mt-3 text-cream/85">{text}</p>
        </div>
        <Link href="/products" className="app-btn-cta shrink-0 text-base">
          Ver la colección <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
