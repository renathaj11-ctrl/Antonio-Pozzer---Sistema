"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const OPERACAO = [
  { href: "/painel", label: "Painel", icon: "▦" },
  { href: "/casos", label: "Casos", icon: "☰" },
  { href: "/casos/novo", label: "Novo caso", icon: "+" },
];

export function Nav({ canAudit }: { canAudit: boolean }) {
  const pathname = usePathname();
  // Menu clicado que ainda não terminou de carregar: destaca na hora.
  const [pendente, setPendente] = useState<string | null>(null);

  useEffect(() => {
    setPendente(null);
  }, [pathname]);

  // Se a navegação falhar (rede, servidor), a barra não fica girando para sempre.
  useEffect(() => {
    if (!pendente) return;
    const t = setTimeout(() => setPendente(null), 8000);
    return () => clearTimeout(t);
  }, [pendente]);

  const atual = (href: string) =>
    href === "/casos" ? pathname === "/casos" || /^\/casos\/[^/]+$/.test(pathname) : pathname === href;

  const ativo = (href: string) => (pendente ? href === pendente : atual(href));

  const link = (href: string, icon: string, label: string) => {
    const marcado = ativo(href);
    const carregando = pendente === href && !atual(href);
    return (
      <Link
        key={href}
        href={href}
        data-active={marcado}
        aria-current={marcado ? "page" : undefined}
        aria-busy={carregando || undefined}
        onClick={() => setPendente(atual(href) ? null : href)}
      >
        <span className="nav-icon" aria-hidden="true">{icon}</span>
        {label}
        {carregando && <span className="tab-loading" aria-hidden="true" />}
      </Link>
    );
  };

  return (
    <>
      {pendente && <span className="nav-progress" aria-hidden="true" />}
      <nav className="nav" aria-label="Navegação principal">
        <span className="nav-label">Operação</span>
        {OPERACAO.map((item) => link(item.href, item.icon, item.label))}

        <span className="nav-label">Gestão</span>
        {canAudit && link("/auditoria", "◎", "Auditoria")}
        {link("/configuracoes", "⚙", "Configurações")}
      </nav>
    </>
  );
}
