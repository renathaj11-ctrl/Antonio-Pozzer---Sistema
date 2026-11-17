"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Tone } from "@/components/ui";

type Item = { key: string; label: string };

/**
 * Abas do caso.
 * O clique marca a aba na hora (sem esperar o servidor) e mostra um giro
 * enquanto o conteúdo novo chega — assim a troca nunca parece "travada".
 */
export function TabNav({
  caseId,
  items,
  active,
  dots,
}: {
  caseId: string;
  items: readonly Item[];
  active: string;
  dots: Record<string, Tone | undefined>;
}) {
  const [escolhida, setEscolhida] = useState<string | null>(null);

  useEffect(() => {
    setEscolhida(null);
  }, [active]);

  // Se a troca de aba falhar (rede, servidor), o giro não fica preso.
  useEffect(() => {
    if (!escolhida) return;
    const t = setTimeout(() => setEscolhida(null), 8000);
    return () => clearTimeout(t);
  }, [escolhida]);

  return (
    <nav className="tabs" aria-label="Seções do caso">
      {items.map((item) => {
        const href = `/casos/${caseId}?tab=${item.key}`;
        // Enquanto o servidor não responde, só a aba clicada fica destacada.
        const ativa = escolhida ? item.key === escolhida : item.key === active;
        const pendente = escolhida === item.key && active !== item.key;

        return (
          <Link
            key={item.key}
            href={href}
            prefetch={false}
            data-active={ativa}
            data-pending={pendente || undefined}
            aria-current={ativa ? "page" : undefined}
            aria-busy={pendente || undefined}
            onClick={() => setEscolhida(item.key === active ? null : item.key)}
          >
            <span className="tab-dot" data-tone={dots[item.key] ?? "none"} />
            {item.label}
            {pendente && <span className="tab-loading" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}
