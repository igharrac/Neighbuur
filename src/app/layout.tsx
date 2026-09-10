import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { LangProvider } from "@/lib/hooks/useLang";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import type { Lang } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neighbuur — Je nieuwbouwhuis, helemaal geregeld",
  description:
    "Vind betrouwbare vakmensen uit jouw buurt en maak stap voor stap van je nieuwbouwwoning een echt thuis. Reviews van buren, directe beschikbaarheid, groepskortingen.",
  openGraph: {
    title: "Neighbuur — Je nieuwbouwhuis, helemaal geregeld",
    description: "Vind betrouwbare vakmensen, lees reviews van je buren, en boek direct.",
    siteName: "Neighbuur",
    locale: "nl_NL",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Neighbuur",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#E8572A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLang = cookies().get("nt_lang")?.value;
  const initialLang: Lang = cookieLang === "en" ? "en" : "nl";

  return (
    <html lang={initialLang}>
      <body>
        <LangProvider initialLang={initialLang}>
          <AuthProvider>
            <ToastProvider>
              {children}
              <ServiceWorkerRegister />
              <InstallBanner />
            </ToastProvider>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
