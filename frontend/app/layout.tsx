import type { Metadata } from "next";
import { MedievalSharp, Oldenburg } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/providers/AuthContext";
import { CartProvider } from "@/shared/providers/CartContext";
import { ToastProvider } from "@/shared/providers/ToastContext";
import AppHeader from "@/shared/layout/AppHeader";
import AppFooter from "@/shared/layout/AppFooter";
import AutumnLeavesBackground from "@/shared/ui/AutumnLeavesBackground";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tribaltrend.com.ar").replace(/\/+$/, "");
const siteName = "Tribal Trend";
const siteDescription = "Tribal Trend: tienda online de artesanías, regalos y decoración hecha a mano en Argentina.";
const logoPath = "/icons/logo_tribal_trnasparente.png";
const logoAbsoluteUrl = `${siteUrl}${logoPath}`;
const openGraphImageUrl = `${siteUrl}/opengraph-image`;
const twitterImageUrl = `${siteUrl}/twitter-image`;
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: siteName,
  url: siteUrl,
  logo: logoAbsoluteUrl,
  image: [logoAbsoluteUrl],
  description: siteDescription,
  sameAs: [siteUrl],
};

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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
        url: openGraphImageUrl,
        width: 1200,
        height: 630,
        alt: "Logo Tribal Trend",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [twitterImageUrl],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AutumnLeavesBackground />
        <div className="app-bg-knot" aria-hidden="true" />
        <div className="app-bg-bracelet" aria-hidden="true" />
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <AppHeader />
              {children}
              <AppFooter />
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

