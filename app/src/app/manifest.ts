import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Antonio Pozzer · Consultório Médico para Imigração",
    short_name: "Antonio Pozzer",
    description:
      "Sistema de triagem pré-entrada de tuberculose para vistos do Reino Unido — Panel Physician, Consultório Médico para Imigração.",
    start_url: "/painel",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f2f7fd",
    theme_color: "#0b2b5b",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["medical", "health", "productivity"],
    shortcuts: [
      {
        name: "Painel",
        short_name: "Painel",
        url: "/painel",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Casos",
        short_name: "Casos",
        url: "/casos",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Nova triagem",
        short_name: "Nova triagem",
        url: "/casos/novo",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
