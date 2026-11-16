/* -----------------------------------------------------------------------------
 * Antonio Pozzer · Consultório Médico para Imigração — service worker
 *
 * Política de cache deliberadamente conservadora por causa da LGPD:
 *  - NUNCA guarda HTML de páginas do sistema (podem conter dados de pacientes);
 *  - navegação é sempre rede; se estiver offline mostra a tela /offline.html;
 *  - só entram no cache arquivos estáticos (ícones, marca, chunks do Next).
 * -------------------------------------------------------------------------- */

const VERSION = "pozzer-v1";
const STATIC_CACHE = `${VERSION}-static`;

const PRECACHE = [
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((chave) => !chave.startsWith(VERSION)).map((chave) => caches.delete(chave))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Páginas: sempre da rede. Sem conexão, aviso neutro (sem dados clínicos).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html").then((res) => res ?? Response.error())),
    );
    return;
  }

  const estatico =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/marca/") ||
    url.pathname === "/manifest.webmanifest";

  if (!estatico) return;

  event.respondWith(
    caches.match(request).then((cacheado) => {
      if (cacheado) {
        // Revalida em segundo plano para a próxima visita.
        fetch(request)
          .then((resposta) => {
            if (resposta.ok) caches.open(STATIC_CACHE).then((cache) => cache.put(request, resposta.clone()));
          })
          .catch(() => {});
        return cacheado;
      }

      return fetch(request).then((resposta) => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copia));
        }
        return resposta;
      });
    }),
  );
});
