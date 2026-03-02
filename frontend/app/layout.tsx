import type { Metadata } from "next";
import { MedievalSharp, Oldenburg } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/providers/AuthContext";
import { CartProvider } from "@/shared/providers/CartContext";
import { ToastProvider } from "@/shared/providers/ToastContext";
import AppHeader from "@/shared/layout/AppHeader";
import AutumnLeavesBackground from "@/shared/ui/AutumnLeavesBackground";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tribaltrend.com.ar").replace(/\/+$/, "");
const siteName = "Tribal Trend";
const siteDescription = "Tribal Trend: tienda online de artesanías, regalos y decoración hecha a mano en Argentina.";
const logoPath = "/icons/logo_tribal_trnasparente.png";
const logoAbsoluteUrl = `${siteUrl}${logoPath}`;

const oldenburg = Oldenburg({
  variable: "--font-oldenburg",
  weight: "400",
  subsets: ["latin"],
});

const medievalSharp = MedievalSharp({
  variable: "--font-medieval-sharp",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  keywords: ["tribal", "artesanías", "tienda", "deco", "hecho a mano"],
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: logoAbsoluteUrl,
        width: 512,
        height: 512,
        alt: "Logo Tribal Trend",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [logoAbsoluteUrl],
  },
  icons: {
    icon: [
      { url: logoPath, type: 'image/png' },
    ],
    shortcut: [
      { url: logoPath, type: 'image/png' },
    ],
    apple: [
      { url: logoPath, type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${oldenburg.variable} ${medievalSharp.variable} antialiased`}
      >
        <AutumnLeavesBackground />
        <div className="app-bg-knot" aria-hidden="true" />
        <div className="app-bg-bracelet" aria-hidden="true" />
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <AppHeader />
              {children}
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

