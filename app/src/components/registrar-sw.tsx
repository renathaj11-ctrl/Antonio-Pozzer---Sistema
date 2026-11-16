"use client";

import { useEffect } from "react";

/**
 * Registra o service worker em produção.
 * Em desenvolvimento fica desligado para não servir chunks antigos do Next.
 */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sem service worker o app continua funcionando, apenas sem offline */
      });
    };

    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });
  }, []);

  return null;
}
