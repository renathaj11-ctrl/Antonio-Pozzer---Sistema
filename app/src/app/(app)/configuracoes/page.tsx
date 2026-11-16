import { requireProfile, ROLE_LABELS } from "@/lib/auth";
import { getTeam } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase/server";
import { Alert, Badge, Card, Dl } from "@/components/ui";
import { InstalarApp } from "@/components/instalar-app";
import { brDate } from "@/lib/format";

export const metadata = { title: "Configurações" };

interface SettingRow {
  key: string;
  value: Record<string, unknown>;
}

interface ClinicRow {
  id: string;
  name: string;
  city: string | null;
  country: string;
  active: boolean;
}

export default async function ConfiguracoesPage() {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();

  const [team, clinicsResult, settingsResult] = await Promise.all([
    getTeam(),
    supabase.from("clinics").select("id, name, city, country, active").order("name"),
    supabase.from("app_settings").select("key, value").order("key"),
  ]);

  const clinics = (clinicsResult.data ?? []) as unknown as ClinicRow[];
  const settings = (settingsResult.data ?? []) as unknown as SettingRow[];

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Configurações</h1>
          <p className="sub">Equipe, clínica, regras versionadas e informações do ambiente.</p>
        </div>
      </header>

      <div className="content stack">
        <div className="grid grid-2">
          <Card title="Equipe" subtitle={`${team.length} perfil(is) cadastrado(s).`} tight>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Papel</th>
                    <th>Registro</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={member.id}>
                      <td className="primary">
                        {member.full_name}
                        {member.id === profile.id && <span className="muted small"> (você)</span>}
                      </td>
                      <td className="small">{ROLE_LABELS[member.role]}</td>
                      <td className="small mono">{member.professional_registry ?? "—"}</td>
                      <td>
                        <Badge tone={member.active ? "ok" : "neutral"}>
                          {member.active ? "ativo" : "inativo"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {team.length === 0 && (
                    <tr><td colSpan={4} className="muted small">Nenhum perfil cadastrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Clínicas" subtitle="Unidades habilitadas para a triagem." tight>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cidade</th>
                    <th>País</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((clinic) => (
                    <tr key={clinic.id}>
                      <td className="primary">{clinic.name}</td>
                      <td className="small">{clinic.city ?? "—"}</td>
                      <td className="small">{clinic.country}</td>
                      <td><Badge tone={clinic.active ? "ok" : "neutral"}>{clinic.active ? "ativa" : "inativa"}</Badge></td>
                    </tr>
                  ))}
                  {clinics.length === 0 && (
                    <tr><td colSpan={4} className="muted small">Nenhuma clínica cadastrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="grid grid-2">
          <Card title="Regras versionadas" subtitle="Parâmetros operacionais gravados em app_settings.">
            <div className="stack">
              {settings.map((setting) => (
                <div key={setting.key}>
                  <p className="section-label">{setting.key}</p>
                  <Dl items={Object.entries(setting.value).map(([key, value]) => ({
                    label: key,
                    value: String(value),
                  }))} />
                </div>
              ))}
              {settings.length === 0 && <p className="muted small">Nenhum parâmetro cadastrado.</p>}
            </div>
          </Card>

          <div className="stack">
            <Card title="Certificado e prazos">
              <Dl
                items={[
                  { label: "Validade", value: "6 meses a partir da CXR" },
                  { label: "Contato familiar negativo", value: "3 meses (UKTBTI v7)" },
                  { label: "Escarro", value: "início ≤ 7 dias da CXR; 3 amostras ≥ 24 h" },
                  { label: "Laudo radiológico", value: "≤ 1 dia útil" },
                  { label: "Resultado do escarro", value: "≤ 10 semanas" },
                  { label: "Re-triagem pós-tratamento", value: "≥ 6 meses" },
                ]}
              />
              <Alert tone="warn">
                A versão 2025 das Technical Instructions pode alterar prazos e a validade para contatos
                familiares. Confirme a versão vigente com <strong>tbscreening@ukhsa.gov.uk</strong>.
              </Alert>
            </Card>

            <Card title="Segurança e LGPD">
              <Dl
                items={[
                  { label: "Retenção local", value: "20 anos (CFM 1.821/2007)" },
                  { label: "Mínimo UK", value: "3 anos (informativo)" },
                  { label: "Base legal", value: "consentimento + obrigação legal do visto" },
                  { label: "Exclusão", value: "sem DELETE via aplicação; rotina administrativa" },
                  { label: "Arquivos", value: "bucket privado 'casos', URLs assinadas" },
                  { label: "Auditoria", value: "gatilhos em todas as tabelas clínicas" },
                ]}
              />
            </Card>
          </div>
        </div>

        <Card title="Como cadastrar um usuário">
          <ol className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>No Supabase, abra <strong>Authentication → Users</strong> e crie o usuário com e-mail e senha.</li>
            <li>Copie o UUID do usuário criado.</li>
            <li>
              Insira o perfil: <code className="mono">insert into public.profiles (id, full_name, role) values ('UUID', 'Nome', 'medico');</code>
            </li>
            <li>Papéis: <code>admin</code>, <code>medico</code>, <code>radiologista</code>, <code>secretaria</code>, <code>enfermeiro</code>, <code>auditor</code>.</li>
            <li>O usuário entra em <code>/entrar</code> com o e-mail e a senha definidos.</li>
          </ol>
        </Card>

        <Card title="Ambiente">
          <Dl
            items={[
              { label: "Aplicação", value: "Antonio Pozzer · Consultório Médico para Imigração" },
              { label: "Desenvolvimento", value: "Criado e desenvolvido por Felipe Schneider" },
              { label: "Banco", value: "Supabase (Postgres + Storage)" },
              { label: "Hospedagem", value: "Vercel (Next.js)" },
              { label: "Fuso", value: "America/Sao_Paulo (registros em UTC)" },
              { label: "Consultas hoje", value: brDate(new Date().toISOString()) },
            ]}
          />
        </Card>

        <Card title="Aplicativo (PWA)" subtitle="Instalação no celular e no computador">
          <InstalarApp variant="card" />
        </Card>
      </div>
    </>
  );
}
