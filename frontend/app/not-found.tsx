import Link from "next/link";
import { IconArrowRight } from "@/shared/ui/Icons";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center md:py-24">
      <p className="app-kicker">Error 404</p>
      <h1 className="app-display text-4xl md:text-5xl">Esta página se perdió en el camino</h1>
      <p className="max-w-md text-dark-gray">
        Puede que la pieza que buscabas ya haya encontrado su hogar. Pero hay muchas más esperándote.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link href="/products" className="app-btn-cta">
          Ver la colección <IconArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/login?redirect=/encargos" className="app-btn-outline">
          Encargar una pieza
        </Link>
      </div>
    </main>
  );
}
