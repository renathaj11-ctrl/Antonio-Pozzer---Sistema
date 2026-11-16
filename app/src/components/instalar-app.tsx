"use client";

import { useEffect, useState } from "react";

type EventoInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Props = {
  /** "inline": link discreto (tela de login). "card": bloco completo (Configurações). */
  variant?: "inline" | "card";
};

function IconeInstalar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 15.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function InstalarApp({ variant = "inline" }: Props) {
  const [evento, setEvento] = useState<EventoInstalacao | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [celular, setCelular] = useState<"ios" | "android" | null>(null);
  const [ajuda, setAjuda] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const modoApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setInstalado(modoApp);

    const ua = window.navigator.userAgent;
    const ehIos =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    setCelular(ehIos ? "ios" : /Android/i.test(ua) ? "android" : null);
    setPronto(true);

    function aoOferecer(e: Event) {
      e.preventDefault();
      setEvento(e as EventoInstalacao);
    }
    function aoInstalar() {
      setInstalado(true);
      setEvento(null);
      setAjuda(false);
    }

    window.addEventListener("beforeinstallprompt", aoOferecer);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoOferecer);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!evento) {
      setAjuda((valor) => !valor);
      return;
    }

    await evento.prompt();
    const escolha = await evento.userChoice?.catch(() => null);
    setEvento(null);

    if (escolha?.outcome === "accepted") setInstalado(true);
    else setAjuda(true);
  }

  const instrucoes =
    celular === "ios" ? (
      <>
        No iPhone/iPad: toque em <strong>Compartilhar</strong> e depois em{" "}
        <strong>Adicionar à Tela de Início</strong>.
      </>
    ) : (
      <>
        No celular: abra o menu <strong>⋮</strong> do navegador e toque em{" "}
        <strong>Instalar aplicativo</strong> (ou <strong>Adicionar à tela inicial</strong>).
      </>
    );

  if (variant === "inline") {
    if (!pronto || instalado) return null;
    if (!evento && !celular) return null;

    return (
      <div className="install-inline-wrap">
        <button className="install-inline" type="button" onClick={instalar}>
          <IconeInstalar className="install-inline-icon" />
          Instalar aplicativo
        </button>
        {ajuda && celular && <p className="install-inline-help">{instrucoes}</p>}
      </div>
    );
  }

  return (
    <div className="install-card">
      <p className="install-lead">
        Instale o sistema como aplicativo no celular ou no computador: abre em tela cheia, com ícone
        próprio e acesso mais rápido.
      </p>

      {!pronto && <p className="small muted">Verificando disponibilidade neste dispositivo…</p>}

      {pronto && instalado && (
        <p className="install-status install-status-ok">
          <span aria-hidden="true">✓</span> Aplicativo instalado neste dispositivo.
        </p>
      )}

      {pronto && !instalado && evento && (
        <button className="btn btn-primary" type="button" onClick={instalar}>
          <IconeInstalar className="install-btn-icon" />
          Instalar aplicativo
        </button>
      )}

      {pronto && !instalado && !evento && (
        <>
          {!ajuda && (
            <button className="btn btn-ghost" type="button" onClick={() => setAjuda(true)}>
              Como instalar neste dispositivo
            </button>
          )}
          {ajuda && (
            <div className="install-help">
              {celular ? (
                <p>{instrucoes}</p>
              ) : (
                <p>
                  No computador: use o ícone de instalação na barra de endereço ou o menu do navegador
                  e escolha <strong>Instalar aplicativo</strong>.
                </p>
              )}
            </div>
          )}
        </>
      )}

      <p className="install-note">
        A instalação não guarda dados de pacientes no aparelho: o acesso continua exigindo login e
        conexão.
      </p>
    </div>
  );
}
