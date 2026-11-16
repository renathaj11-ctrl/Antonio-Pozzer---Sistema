import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { entrar } from "@/lib/actions/auth";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Alert } from "@/components/ui";
import { CampoEmail } from "@/components/campo-email";
import { CampoSenha } from "@/components/campo-senha";
import { InstalarApp } from "@/components/instalar-app";

export const metadata = { title: "Entrar" };

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function Aviao({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.8.5-1.2Z" />
    </svg>
  );
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const erro = first(sp.erro);
  const next = first(sp.next) ?? "/painel";
  const configured = isSupabaseConfigured();

  if (configured) {
    const session = await getSessionProfile();
    if (session.user) redirect(next.startsWith("/") ? next : "/painel");
  }

  return (
    <main className="login-page">
      <Aviao className="login-sky-plane" />

      <section className="login-card">
        <aside
          className="login-brand"
          role="img"
          aria-label="Antonio Pozzer — Consultório Médico para Imigração"
        >
          <span className="login-brand-photo" aria-hidden="true">
            <Image
              src="/marca/login-painel.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 1100px) 1px, 620px"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </span>
          <span className="login-brand-mini" aria-hidden="true">
            <Image
              src="/marca/logo-antonio-pozzer-branco.png"
              alt=""
              width={640}
              height={580}
              priority
            />
          </span>
        </aside>

        <div className="login-panel">
          <div className="login-panel-inner">
            <div className="login-panel-top">
              <span className="login-eyebrow">Área restrita</span>
              <h1>Acesso ao sistema</h1>
              <p>Acesse sua conta para continuar</p>
            </div>

            {!configured ? (
              <div className="login-setup">
                <Alert tone="warn">
                  <strong>Supabase não configurado.</strong>
                  <p style={{ marginTop: 4 }}>
                    Crie o arquivo <code>.env.local</code> na pasta <code>app</code> com as chaves do projeto:
                  </p>
                  <pre className="mono" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
{`NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon`}
                  </pre>
                </Alert>
                <p className="small muted">
                  Depois execute as migrações em <code>app/supabase/migrations</code> (0001 → 0004) e crie o
                  primeiro usuário em Authentication → Users.
                </p>
                <Link className="btn" href="/entrar">Recarregar</Link>
              </div>
            ) : (
              <form action={entrar} className="login-form">
                {erro === "perfil" ? (
                  <Alert tone="warn">
                    Seu usuário existe, mas ainda não tem perfil ativo. Peça ao administrador para criar o
                    registro em <code>profiles</code>.
                  </Alert>
                ) : (
                  erro && <Alert tone="danger">{erro}</Alert>
                )}

                <CampoEmail />
                <CampoSenha />
                <input type="hidden" name="next" value={next} />

                <button className="login-submit" type="submit">
                  <span>Entrar no sistema</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                    <path d="M4.5 12h14M13 6.5 18.5 12 13 17.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            )}

            <div className="login-rule" aria-hidden="true">
              <span><Aviao /></span>
            </div>

            <p className="login-foot">
              Dados clínicos sensíveis (LGPD art. 11).<br />
              Acesso restrito à equipe autorizada e auditado.
            </p>

            <InstalarApp />
          </div>
        </div>
      </section>

      <div className="login-legal">
        <p>© 2026 Antonio Pozzer · Consultório Médico para Imigração</p>
        <p className="login-credit">Criado e desenvolvido por Felipe Schneider</p>
      </div>
    </main>
  );
}
