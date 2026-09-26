"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuth } from "@/shared/providers/AuthContext";
import { useCart } from "@/shared/providers/CartContext";
import InstagramButton from "@/shared/ui/InstagramButton";
import { getEncargosHref, LANDING_URL } from "@/shared/lib/brand";
import { IconBag, IconClose, IconMenu, IconUser } from "@/shared/ui/Icons";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
};

export default function AppHeader() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [desktopMenuPosition, setDesktopMenuPosition] = useState({ top: 0, left: 0 });
  const desktopTriggerRef = useRef<HTMLButtonElement | null>(null);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = isAuthenticated && user?.id_rol === 1;
  const isClient = isAuthenticated && user?.id_rol === 2;

  const navItems: NavItem[] = [
    { href: "/products", label: "Tienda" },
    ...(!isAdmin ? [{ href: getEncargosHref(isAuthenticated), label: "Encargos" }] : []),
    ...(isClient ? [{ href: "/mis-pedidos", label: "Mis pedidos" }] : []),
    ...(isAdmin ? [{ href: "/dashboard", label: "Dashboard" }, { href: "/dashboard/chat", label: "Chat" }] : []),
    { href: "/blog", label: "Blog" },
    { href: LANDING_URL, label: "Conocenos", external: true },
  ];

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

  const handleLogout = async () => {
    await logout();
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

  const isActive = (href: string) => href === "/products" ? pathname?.startsWith("/products") : pathname === href;

  const renderNavLink = (item: NavItem, className: string) => (
    <Link
      key={item.label}
      href={item.href}
      className={className}
      data-active={isActive(item.href)}
      onClick={closeMenus}
      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {item.label}
    </Link>
  );

  const userMenuItems = (
    <>
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
    </>
  );

  const renderUserDropdown = ({ mobile = false }: { mobile?: boolean }) => {
    if (loading) {
      return <span className="text-sm text-dark-gray">Cargando...</span>;
    }

    if (!isAuthenticated) {
      return mobile ? (
        <div className="grid grid-cols-2 gap-2">
          <Link href="/login" className="app-btn-outline text-sm" onClick={closeMenus}>
            Ingresar
          </Link>
          <Link href="/register" className="app-btn-cta text-sm" onClick={closeMenus}>
            Crear cuenta
          </Link>
        </div>
      ) : (
        <Link href="/login" className="app-nav-link flex items-center gap-2 text-sm" onClick={closeMenus}>
          <IconUser className="h-5 w-5" />
          Ingresar
        </Link>
      );
    }

    if (mobile) {
      return (
        <div className="w-full" ref={mobileMenuRef}>
          <button
            type="button"
            className="app-nav-link flex cursor-pointer items-center gap-2"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
          >
            <IconUser className="h-5 w-5" />
            {user?.nombre ?? "Usuario"}
          </button>

          <div
            className="app-collapsible mt-2 w-full rounded-md border border-earth-brown bg-cream shadow-lg"
            data-open={isUserMenuOpen}
            aria-hidden={!isUserMenuOpen}
          >
            {userMenuItems}
          </div>
        </div>
      );
    }

    return (
      <>
        <button
          ref={desktopTriggerRef}
          type="button"
          className="app-nav-link flex cursor-pointer items-center gap-2 text-sm"
          onClick={() => {
            setIsUserMenuOpen((prev) => !prev);
            updateDesktopMenuPosition();
          }}
          aria-expanded={isUserMenuOpen}
          aria-haspopup="menu"
        >
          <IconUser className="h-5 w-5" />
          <span className="max-w-32 truncate">{user?.nombre ?? "Usuario"}</span>
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
            {userMenuItems}
          </div>,
          document.body,
        )}
      </>
    );
  };

  return (
    <header className="app-header-shared sticky top-0 z-110 border-b border-earth-brown/40">
      <div className="relative z-10 mx-auto grid h-16 w-full max-w-360 grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 md:h-20 md:px-5">
        <div className="flex items-center">
          <div className="md:hidden">
            <button
              type="button"
              className="app-icon-btn"
              onClick={() => {
                setIsMobileOpen((prev) => !prev);
                setIsUserMenuOpen(false);
              }}
              aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-nav"
            >
              {isMobileOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
            </button>
          </div>

          <Link href="/products" className="hidden items-center gap-3 md:flex" aria-label="Tribal Trend, ir a la tienda">
            <Image
              src="/icons/logo_tribal_trnasparente.png"
              alt="Logo Tribal Trend"
              width={64}
              height={64}
              className="h-14 w-14 object-contain"
              priority
            />
            <span className="app-display text-2xl">Tribal Trend</span>
          </Link>
        </div>

        <div className="flex justify-center">
          <Link href="/products" className="md:hidden" aria-label="Tribal Trend, ir a la tienda">
            <Image
              src="/icons/logo_tribal_trnasparente.png"
              alt="Logo Tribal Trend"
              width={52}
              height={52}
              className="h-12 w-12 object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Navegación principal">
            {navItems.map((item) =>
              renderNavLink(
                item,
                "app-nav-link relative py-1 text-[0.95rem] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-earth-brown after:transition-transform hover:after:scale-x-100 data-[active=true]:after:scale-x-100",
              ),
            )}
          </nav>
        </div>

        <div className="flex items-center justify-end gap-1 md:gap-2">
          <div className="hidden md:block">{renderUserDropdown({ mobile: false })}</div>
          <div className="hidden md:block">
            <InstagramButton className="app-icon-btn" />
          </div>
          {!isAdmin && (
            <button
              type="button"
              className="app-icon-btn"
              onClick={openCart}
              aria-label={`Abrir carrito, ${totalItems} ${totalItems === 1 ? "pieza" : "piezas"}`}
            >
              <IconBag className="h-6 w-6" />
              {totalItems > 0 && (
                // La key reinicia la animación de "salto" cada vez que cambia la cantidad.
                <span key={totalItems} className="app-count-badge" data-bump="true">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <nav
        id="mobile-nav"
        className="app-collapsible relative z-10 border-t border-earth-brown/30 md:hidden"
        data-open={isMobileOpen}
        aria-hidden={!isMobileOpen}
        aria-label="Navegación principal"
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          {navItems.map((item) =>
            renderNavLink(
              item,
              "font-display border-b border-line/70 py-2.5 text-xl text-black data-[active=true]:text-earth-brown",
            ),
          )}
          <div className="mt-4 space-y-4">
            {renderUserDropdown({ mobile: true })}
            <div className="flex items-center gap-3 text-sm text-dark-gray">
              <InstagramButton onClick={closeMenus} />
              Seguinos en Instagram
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
