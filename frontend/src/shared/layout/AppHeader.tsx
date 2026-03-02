"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuth } from "@/shared/providers/AuthContext";

export default function AppHeader() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [desktopMenuPosition, setDesktopMenuPosition] = useState({ top: 0, left: 0 });
  const desktopTriggerRef = useRef<HTMLButtonElement | null>(null);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const syncViewport = () => setIsDesktopViewport(window.innerWidth >= 768);
    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  const updateDesktopMenuPosition = () => {
    if (!desktopTriggerRef.current) {
      return;
    }

    const rect = desktopTriggerRef.current.getBoundingClientRect();
    const menuWidth = 224;
    const viewportPadding = 8;
    const rawLeft = rect.right - menuWidth;
    const clampedLeft = Math.max(
      viewportPadding,
      Math.min(rawLeft, window.innerWidth - menuWidth - viewportPadding),
    );

    setDesktopMenuPosition({
      top: rect.bottom + 8,
      left: clampedLeft,
    });
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
    router.replace("/products");
    router.refresh();
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = desktopTriggerRef.current?.contains(target);
      const clickedDesktopMenu = desktopMenuRef.current?.contains(target);
      const clickedMobileMenu = mobileMenuRef.current?.contains(target);

      if (clickedTrigger || clickedDesktopMenu || clickedMobileMenu) {
        return;
      }

      setIsUserMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    updateDesktopMenuPosition();

    const handleViewportChange = () => updateDesktopMenuPosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isUserMenuOpen]);

  const closeMenus = () => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  };

  const renderUserDropdown = ({ mobile = false }: { mobile?: boolean }) => {
    if (loading) {
      return <span className="text-sm text-dark-gray">Cargando...</span>;
    }

    if (!isAuthenticated) {
      return (
        <div className={`flex ${mobile ? "flex-col gap-2" : "items-center gap-4"}`}>
          <Link href="/login" className="app-nav-link cursor-pointer" onClick={closeMenus}>
            Iniciar sesión
          </Link>
          <Link href="/register" className="app-nav-link cursor-pointer" onClick={closeMenus}>
            Registrarse
          </Link>
        </div>
      );
    }

    if (mobile) {
      return (
        <div className="w-full" ref={mobileMenuRef}>
          <button
            type="button"
            className="app-nav-link cursor-pointer"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
          >
            {user?.nombre ?? "Usuario"}
          </button>

          <div
            className="app-collapsible mt-2 w-full rounded-md border border-earth-brown bg-cream shadow-lg"
            data-open={isUserMenuOpen}
            aria-hidden={!isUserMenuOpen}
          >
            <Link
              href="/AccounConfig"
              className="block cursor-pointer px-4 py-2 text-sm text-black hover:bg-earth-brown hover:text-cream"
              onClick={closeMenus}
              tabIndex={isUserMenuOpen ? 0 : -1}
            >
              Configuración de cuenta
            </Link>
            <button
              type="button"
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-black hover:bg-earth-brown hover:text-cream"
              onClick={handleLogout}
              tabIndex={isUserMenuOpen ? 0 : -1}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <button
          ref={desktopTriggerRef}
          type="button"
          className="app-nav-link cursor-pointer"
          onClick={() => {
            setIsUserMenuOpen((prev) => !prev);
            updateDesktopMenuPosition();
          }}
          aria-expanded={isUserMenuOpen}
          aria-haspopup="menu"
        >
          {user?.nombre ?? "Usuario"}
        </button>

        {isMounted && isDesktopViewport && createPortal(
          <div
            ref={desktopMenuRef}
            className="app-dropdown-panel rounded-md border border-earth-brown bg-cream shadow-lg"
            data-open={isUserMenuOpen}
            aria-hidden={!isUserMenuOpen}
            style={{
              position: "fixed",
              top: desktopMenuPosition.top,
              left: desktopMenuPosition.left,
              width: 224,
              zIndex: 9999,
            }}
          >
            <Link
              href="/AccounConfig"
              className="block cursor-pointer px-4 py-2 text-sm text-black hover:bg-earth-brown hover:text-cream"
              onClick={closeMenus}
              tabIndex={isUserMenuOpen ? 0 : -1}
            >
              Configuración de cuenta
            </Link>
            <button
              type="button"
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-black hover:bg-earth-brown hover:text-cream"
              onClick={handleLogout}
              tabIndex={isUserMenuOpen ? 0 : -1}
            >
              Cerrar sesión
            </button>
          </div>,
          document.body,
        )}
      </>
    );
  };

  return (
    <header className="relative z-110 border-b border-earth-brown bg-cream/95 backdrop-blur">
      <div className="mx-auto w-full max-w-360 px-4 py-2">
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
              width={84}
              height={84}
              className="h-18 w-18 object-contain"
              priority
            />
            <span className="text-xl font-semibold tracking-wide text-black">Tribal Trend</span>
          </Link>

          <button
            type="button"
            className="app-btn-secondary cursor-pointer md:hidden"
            onClick={() => {
              setIsMobileOpen((prev) => !prev);
              setIsUserMenuOpen(false);
            }}
          >
            Menú
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/products" className="app-nav-link cursor-pointer">
              Productos
            </Link>
            {isAuthenticated && user?.id_rol === 2 && (
              <Link href="/mis-pedidos" className="app-nav-link cursor-pointer">
                Mis pedidos
              </Link>
            )}
            {isAuthenticated && user?.id_rol === 1 && (
              <Link href="/dashboard" className="app-nav-link cursor-pointer">
                Dashboard
              </Link>
            )}
            {renderUserDropdown({ mobile: false })}
          </nav>
        </div>
      </div>

      <nav
        className="app-collapsible relative z-110 flex flex-col gap-3 border-t border-earth-brown px-4 py-3 md:hidden"
        data-open={isMobileOpen}
        aria-hidden={!isMobileOpen}
      >
          <Link href="/products" className="app-nav-link cursor-pointer" onClick={closeMenus}>
            Productos
          </Link>
          {isAuthenticated && user?.id_rol === 2 && (
            <Link href="/mis-pedidos" className="app-nav-link cursor-pointer" onClick={closeMenus}>
              Mis pedidos
            </Link>
          )}
          {isAuthenticated && user?.id_rol === 1 && (
            <Link href="/dashboard" className="app-nav-link cursor-pointer" onClick={closeMenus}>
              Dashboard
            </Link>
          )}
          {renderUserDropdown({ mobile: true })}
      </nav>
    </header>
  );
}

