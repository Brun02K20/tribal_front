"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminShellProps } from "@/types/admin-ui";

const menuItems = [
  { label: "Productos", href: "/dashboard/productos" },
  { label: "Pedidos", href: "/dashboard/pedidos" },
  { label: "Categorias", href: "/dashboard/categorias" },
  { label: "Subcategorias", href: "/dashboard/subcategorias" },
  { label: "Estados Pedido", href: "/dashboard/estados-pedido" },
  { label: "Estados Envio", href: "/dashboard/estados-envio" },
];

export default function AdminShell({
  title,
  subtitle,
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  return (
    <main className="app-page">
      <section className="app-container mx-auto max-w-6xl">
        <div className="app-panel grid min-h-[70vh] grid-cols-1 md:grid-cols-[250px_1fr]">
          <aside className="border-b border-line p-4 md:border-b-0 md:border-r">
            <h1 className="app-title mb-4 text-xl">Dashboard Admin</h1>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`app-btn-secondary text-left ${isActive ? "bg-earth-brown text-cream" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="p-6">
            <h2 className="app-title text-2xl">{title}</h2>
            {subtitle && <p className="app-subtitle mt-2">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
