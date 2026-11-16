import type { Metadata, Viewport } from "next";
import { RegistrarServiceWorker } from "@/components/registrar-sw";
import "./globals.css";

const APP_NAME = "Antonio Pozzer · Consultório Médico para Imigração";

export const metadata: Metadata = {
  title: {
    default: "Antonio Pozzer · Triagem TB",
    template: "%s · Antonio Pozzer",
  },
  description:
    "Sistema de triagem pré-entrada de tuberculose para vistos do Reino Unido — Panel Physician, Consultório Médico para Imigração.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Antonio Pozzer",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  other: {
    // Safari/iOS ainda lê a tag legada para abrir em tela cheia.
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b2b5b",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <RegistrarServiceWorker />
        {children}
      </body>
    </html>
  );
}
