"use client";

import { useState } from "react";

export function CampoSenha() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="login-field">
      <label htmlFor="password">Senha</label>
      <div className="login-input">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <rect x="4" y="10.5" width="16" height="9.5" rx="2.5" />
          <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" strokeLinecap="round" />
        </svg>
        <input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Sua senha"
          required
        />
        <button
          type="button"
          className="login-eye"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6.4 0 10 6 10 6a17.6 17.6 0 0 1-3 3.6M6.4 7.7A17.4 17.4 0 0 0 2 12s3.6 6 10 6a10.6 10.6 0 0 0 4.3-.9" strokeLinecap="round" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
