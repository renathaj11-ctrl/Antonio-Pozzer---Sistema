import Image from "next/image";
import Link from "next/link";
import { requireProfile, ROLE_LABELS } from "@/lib/auth";
import { sair } from "@/lib/actions/auth";
import { initials } from "@/lib/format";
import { Nav } from "@/components/nav";

// Todas as telas internas dependem de sessão e RLS: sempre renderizar no servidor.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireProfile();
  const canAudit = profile.role === "admin" || profile.role === "auditor";

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/painel" aria-label="Antonio Pozzer — ir para o painel">
          <span className="brand-plate">
            <Image
              src="/marca/logo-antonio-pozzer.png"
              alt="Antonio Pozzer — Consultório Médico para Imigração"
              width={267}
              height={242}
              priority
              className="brand-logo"
            />
          </span>

          <span className="brand-mobile">
            <span className="brand-mobile-plate">
              <Image
                src="/marca/logo-marca-256.png"
                alt=""
                width={256}
                height={132}
                priority
                className="brand-mobile-mark"
              />
            </span>
            <span className="brand-mobile-text">
              <strong>Antonio Pozzer</strong>
              <span>Triagem TB · Reino Unido</span>
            </span>
          </span>
        </Link>

        <Nav canAudit={canAudit} />

        <div className="sidebar-foot">
          <div className="who">
            <span className="avatar" aria-hidden="true">{initials(profile.full_name)}</span>
            <span className="who-text">
              <strong>{profile.full_name}</strong>
              <span>{ROLE_LABELS[profile.role]}</span>
            </span>
          </div>
          <form action={sair}>
            <button className="btn btn-sm btn-block btn-sidebar" type="submit">
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="main">{children}</div>
    </div>
  );
}
