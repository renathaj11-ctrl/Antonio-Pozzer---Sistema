"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/painel", label: "Painel", icon: "▦" },
  { href: "/casos", label: "Casos", icon: "☰" },
  { href: "/casos/novo", label: "Novo caso", icon: "+" },
];

export function Nav({ canAudit }: { canAudit: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/casos" ? pathname === "/casos" || /^\/casos\/[^/]+$/.test(pathname) : pathname === href;

  return (
    <nav className="nav" aria-label="Navegação principal">
      <span className="nav-label">Operação</span>
      {ITEMS.map((item) => (
        <Link key={item.href} href={item.href} data-active={isActive(item.href)}>
          <span className="nav-icon" aria-hidden="true">{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <span className="nav-label">Gestão</span>
      {canAudit && (
        <Link href="/auditoria" data-active={pathname === "/auditoria"}>
          <span className="nav-icon" aria-hidden="true">◎</span>
          Auditoria
        </Link>
      )}
      <Link href="/configuracoes" data-active={pathname === "/configuracoes"}>
        <span className="nav-icon" aria-hidden="true">⚙</span>
        Configurações
      </Link>
    </nav>
  );
}
