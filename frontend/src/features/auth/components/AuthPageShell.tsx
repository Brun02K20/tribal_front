"use client";

import Link from "next/link";
import type { ReactNode, RefObject } from "react";
import { IconCheck, IconLock } from "@/shared/ui/Icons";

type AuthPageShellProps = {
  title: string;
  children: ReactNode;
  error?: string | null;
  googleContainerRef: RefObject<HTMLDivElement | null>;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
  mode?: "login" | "register";
  redirect?: string;
};

const benefits = [
  "Seguí tus pedidos en todo momento",
  "Encargá piezas personalizadas",
  "Chateá directo con nosotros",
  "Calificá las piezas que compraste",
];

// Mensaje según desde dónde llegó la persona: le recuerda por qué vale la pena ingresar.
const getContext = (mode: "login" | "register", redirect?: string) => {
  if (redirect?.startsWith("/checkout")) {
    return {
      kicker: "Último paso",
      title: "Estás a un paso de tu compra",
      text: "Ingresá para finalizar tu pedido. Tu carrito queda guardado.",
    };
  }
  if (redirect?.startsWith("/encargos")) {
    return {
      kicker: "Encargos personalizados",
      title: "Contanos la pieza que soñás",
      text: "Ingresá o creá tu cuenta para pedir tu diseño a medida.",
    };
  }
  return mode === "login"
    ? { kicker: "Hola de nuevo", title: "Qué bueno verte otra vez", text: "Ingresá para seguir tus pedidos y comprar más rápido." }
    : { kicker: "Sumate a la tribu", title: "Creá tu cuenta en segundos", text: "Comprá más rápido y seguí cada pedido de cerca." };
};

export default function AuthPageShell({
  title,
  children,
  error,
  googleContainerRef,
  footerText,
  footerHref,
  footerLinkLabel,
  mode = "login",
  redirect,
}: AuthPageShellProps) {
  const context = getContext(mode, redirect);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-14">
      <div className="grid overflow-hidden rounded-[2rem] border border-line bg-white/85 shadow-[0_24px_60px_rgba(47,47,47,0.14)] md:grid-cols-[1fr_1.1fr]">
        <aside className="app-campaign rounded-none! p-7 md:p-10">
          <div className="relative z-10 flex h-full flex-col">
            <p className="app-kicker">{context.kicker}</p>
            <p className="app-display mt-2 text-3xl md:text-4xl">{context.title}</p>
            <p className="mt-3 text-sm text-cream/85">{context.text}</p>
            <ul className="mt-6 hidden space-y-3 text-sm text-cream/90 md:block">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-mustard/25 text-mustard">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <p className="mt-auto hidden items-center gap-2 pt-8 text-xs text-cream/70 md:flex">
              <IconLock className="h-4 w-4" /> Tus datos están protegidos.
            </p>
          </div>
        </aside>

        <section className="p-6 md:p-10">
          <h1 className="app-display mb-5 text-3xl">{title}</h1>

          {children}

          <div className="app-ornament my-5 text-xs" aria-hidden="true">o</div>
          <div ref={googleContainerRef} className="flex justify-center" />

          {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <p className="mt-6 text-center text-sm text-dark-gray">
            {footerText}{" "}
            <Link href={footerHref} className="cursor-pointer font-semibold text-earth-brown underline underline-offset-4">
              {footerLinkLabel}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
