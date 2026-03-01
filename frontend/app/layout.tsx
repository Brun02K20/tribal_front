import type { Metadata } from "next";
import { MedievalSharp, Oldenburg } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { CartProvider } from "@/src/context/CartContext";
import { ToastProvider } from "@/src/context/ToastContext";
import AppHeader from "@/src/components/AppHeader";
import AutumnLeavesBackground from "@/src/components/ui/AutumnLeavesBackground";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "Tribal Trend";
const siteDescription = "Tienda de artesanías";
const logoPath = "/icons/logo_tribal_trnasparente.png";

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
        url: logoPath,
        width: 512,
        height: 512,
        alt: "Logo Tribal Trend",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
    images: [logoPath],
  },
  icons: {
    icon: logoPath,
    shortcut: logoPath,
    apple: logoPath,
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
