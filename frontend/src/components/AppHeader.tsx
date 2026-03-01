"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

export default function AppHeader() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
    router.push("/products");
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!userMenuRef.current) {
        return;
      }

      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const renderSessionOptions = () => {
    if (loading) {
      return <span className="text-sm text-dark-gray">Cargando...</span>;
    }

    if (!isAuthenticated) {
      return (
        <Link href="/login" className="app-nav-link" onClick={() => setIsMobileOpen(false)}>
          Iniciar Sesión
        </Link>
      );
    }

    return (
      <div className="relative" ref={userMenuRef}>
        <button
          type="button"
          className="app-nav-link"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
        >
          {user?.nombre ?? "Usuario"}
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-md border border-earth-brown bg-cream shadow-lg">
            <Link
              href="/AccounConfig"
              className="block px-4 py-2 text-sm text-black hover:bg-earth-brown hover:text-cream"
              onClick={() => {
                setIsUserMenuOpen(false);
                setIsMobileOpen(false);
              }}
            >
              Configuración de cuenta
            </Link>
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm text-black hover:bg-earth-brown hover:text-cream"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="border-b border-earth-brown bg-cream/95 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-3">
        <div className="mb-3 flex justify-center md:hidden">
          <Link href="/products" className="flex items-center gap-2">
            <Image
              src="/icons/logo_tribal_trnasparente.png"
              alt="Logo Tribal Trend"
              width={96}
              height={96}
              className="h-24 w-24 object-contain"
              priority
            />
          </Link>
        </div>

        <div className="flex w-full items-center justify-between">
          <Link href="/products" className="hidden items-center gap-3 md:flex">
            <Image
              src="/icons/logo_tribal_trnasparente.png"
              alt="Logo Tribal Trend"
              width={72}
              height={72}
              className="h-16 w-16 object-contain"
              priority
            />
            <span className="text-xl font-semibold tracking-wide text-black">Tribal Trend</span>
          </Link>

          <button
            type="button"
            className="app-btn-secondary md:hidden"
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            Menú
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/products" className="app-nav-link">
              Productos
            </Link>
            {isAuthenticated && user?.id_rol === 2 && (
              <Link href="/mis-pedidos" className="app-nav-link">
                Mis pedidos
              </Link>
            )}
            {isAuthenticated && user?.id_rol === 1 && (
              <Link href="/dashboard" className="app-nav-link">
                Dashboard
              </Link>
            )}
            {renderSessionOptions()}
          </nav>
        </div>
      </div>

      {isMobileOpen && (
        <nav className="flex flex-col gap-3 border-t border-earth-brown px-4 py-3 md:hidden">
          <Link href="/products" className="app-nav-link" onClick={() => setIsMobileOpen(false)}>
            Productos
          </Link>
          {isAuthenticated && user?.id_rol === 2 && (
            <Link href="/mis-pedidos" className="app-nav-link" onClick={() => setIsMobileOpen(false)}>
              Mis pedidos
            </Link>
          )}
          {isAuthenticated && user?.id_rol === 1 && (
            <Link href="/dashboard" className="app-nav-link" onClick={() => setIsMobileOpen(false)}>
              Dashboard
            </Link>
          )}
          {renderSessionOptions()}
        </nav>
      )}
    </header>
  );
}
