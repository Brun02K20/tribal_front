"use client";

import Link from "next/link";
import type { ReactNode, RefObject } from "react";

type AuthPageShellProps = {
  title: string;
  children: ReactNode;
  error?: string | null;
  googleContainerRef: RefObject<HTMLDivElement | null>;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
};

export default function AuthPageShell({
  title,
  children,
  error,
  googleContainerRef,
  footerText,
  footerHref,
  footerLinkLabel,
}: AuthPageShellProps) {
  return (
    <main className="app-page">
      <section className="app-container app-panel mx-auto flex max-w-md flex-col justify-center p-6">
        <h1 className="app-title mb-4 text-2xl">{title}</h1>

        {children}

        <div className="my-4 text-center text-sm app-subtitle">o</div>
        <div ref={googleContainerRef} className="flex justify-center" />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <p className="mt-6 text-sm app-subtitle">
          {footerText} <Link href={footerHref} className="cursor-pointer underline">{footerLinkLabel}</Link>
        </p>
      </section>
    </main>
  );
}
