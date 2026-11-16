"use client";

import { useEffect, useState } from "react";

const KEY = "pozzer.email";

/**
 * Campo de e-mail com memória local opcional.
 * O "lembrar" guarda apenas o e-mail no navegador — nunca a senha.
 */
export function CampoEmail({ defaultValue = "" }: { defaultValue?: string }) {
  const [email, setEmail] = useState(defaultValue);
  const [remember, setRemember] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved = "";
    try {
      saved = window.localStorage.getItem(KEY) ?? "";
    } catch {
      saved = "";
    }
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (remember && email) window.localStorage.setItem(KEY, email);
      else window.localStorage.removeItem(KEY);
    } catch {
      // Navegação privada pode bloquear o storage; seguir sem lembrar.
    }
  }, [email, remember, ready]);

  return (
    <>
      <div className="login-field">
        <label htmlFor="email">E-mail</label>
        <div className="login-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <rect x="2.8" y="5" width="18.4" height="14" rx="2.6" />
            <path d="m3.4 7 8.6 6.2L20.6 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />
        </div>
      </div>

      <label className="login-check">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        <span>Lembrar meu e-mail neste dispositivo</span>
      </label>
    </>
  );
}
