import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-page">
      <section className="app-container app-panel mx-auto flex max-w-lg flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="app-title text-3xl">404</h1>
        <p className="app-subtitle text-lg">La página que buscás no existe.</p>
        <p className="app-subtitle text-sm">Revisá la URL o volvé al catálogo principal.</p>
        <Link href="/products" className="app-btn-primary">
          Ir a productos
        </Link>
      </section>
    </main>
  );
}
