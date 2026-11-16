import Link from "next/link";
import { requireProfile, ROLE_LABELS } from "@/lib/auth";
import { getDashboard } from "@/lib/data";
import { brDate, age } from "@/lib/format";
import { STATUS_META, nextAction, missingCount, checklist } from "@/lib/rules";
import { Alert, Badge, Card, Empty, Progress, Stat } from "@/components/ui";
import type { Tone } from "@/components/ui";

export const metadata = { title: "Painel" };

export default async function PainelPage() {
  const { profile } = await requireProfile();
  const data = await getDashboard();
  const { rows, totals, attention } = data;

  const active = rows.filter((r) => !["encerrado", "cancelado", "certificado_emitido"].includes(r.status));
  const tracked = active[0] ?? rows[0] ?? null;
  const recent = rows.slice(0, 8);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Painel</h1>
          <p className="sub">
            {ROLE_LABELS[profile.role]} · {profile.full_name}
          </p>
        </div>
        <div className="topbar-actions">
          <Link className="btn" href="/casos">Ver todos os casos</Link>
          <Link className="btn btn-primary" href="/casos/novo">+ Novo caso</Link>
        </div>
      </header>

      <div className="content stack" style={{ gap: 18 }}>
        {rows.length === 0 ? (
          <Card>
            <Empty title="Nenhum caso registrado ainda">
              Comece abrindo o primeiro caso de triagem. O sistema guia o fluxo do consentimento até o
              certificado ou encaminhamento.
              <div style={{ marginTop: 14 }}>
                <Link className="btn btn-primary" href="/casos/novo">Abrir primeiro caso</Link>
              </div>
            </Empty>
          </Card>
        ) : (
          <>
            <div className="kpi-grid">
              <Stat label="Casos ativos" value={totals.active} hint={`${rows.length} ${rows.length === 1 ? "caso" : "casos"} no total`} />
              <Stat
                label="Aguardando laudo"
                value={totals.awaitingReport}
                hint="CXR realizada, laudo pendente"
                tone={totals.awaitingReport > 0 ? "warn" : undefined}
              />
              <Stat
                label="Escarro no prazo crítico"
                value={totals.sputumDue}
                hint="Vence em até 7 dias (regra: 7 dias da CXR)"
                tone={totals.sputumDue > 0 ? "danger" : undefined}
              />
              <Stat
                label="Certificados no mês"
                value={totals.certificatesMonth}
                hint={`${totals.referrals} encaminhamentos registrados`}
                tone="ok"
              />
            </div>

            <div className="grid grid-side">
              <div className="stack">
                <Card
                  title="Precisam de atenção"
                  subtitle="Prazos vencidos, laudos pendentes e casos com escarro positivo."
                  actions={<Link className="btn btn-sm" href="/casos">Abrir lista</Link>}
                  tight
                >
                  {attention.length === 0 ? (
                    <Empty title="Nada crítico no momento">Nenhum caso exige ação imediata.</Empty>
                  ) : (
                    <div className="table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Caso</th>
                            <th>Requerente</th>
                            <th>Motivo</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {attention.map((row) => {
                            const lateSputum =
                              row.sputum_deadline &&
                              new Date(`${row.sputum_deadline}T12:00:00`).getTime() < Date.now() &&
                              row.sputum_status !== "negativo" &&
                              row.sputum_status !== "positivo";
                            const reason = lateSputum
                              ? `Prazo do escarro venceu em ${brDate(row.sputum_deadline)}`
                              : row.cxr_result === "tb_ativa_ou_antiga" && row.sputum_status === "positivo"
                                ? "Escarro positivo — encaminhar"
                                : "CXR sem laudo";
                            return (
                              <tr key={row.id}>
                                <td className="mono nowrap">{row.case_number}</td>
                                <td>
                                  <div className="primary">{row.full_name}</div>
                                  <div className="sub">
                                    {row.category === "crianca" ? "Criança" : row.category === "gestante" ? "Gestante" : "Adulto"}
                                  </div>
                                </td>
                                <td>
                                  <Badge tone={lateSputum || reason.includes("positivo") ? "danger" : "warn"}>
                                    {reason}
                                  </Badge>
                                </td>
                                <td className="right">
                                  <Link className="btn btn-sm" href={`/casos/${row.id}?tab=${nextAction(row).tab}`}>
                                    Abrir
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <Card
                  title="Casos recentes"
                  subtitle="Últimos casos abertos na clínica."
                  actions={<Link className="btn btn-sm" href="/casos">Ver todos</Link>}
                  tight
                >
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Caso</th>
                          <th>Requerente</th>
                          <th>Status</th>
                          <th>Próxima ação</th>
                          <th>Abertura</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((row) => {
                          const meta = STATUS_META[row.status];
                          const action = nextAction(row);
                          return (
                            <tr key={row.id}>
                              <td className="mono nowrap">
                                <Link href={`/casos/${row.id}`}>{row.case_number}</Link>
                              </td>
                              <td>
                                <div className="primary">{row.full_name}</div>
                                <div className="sub">{age(row.date_of_birth)}</div>
                              </td>
                              <td><Badge tone={meta.tone as Tone}>{meta.label}</Badge></td>
                              <td>
                                <Link href={`/casos/${row.id}?tab=${action.tab}`} className="small">
                                  {action.label}
                                </Link>
                              </td>
                              <td className="nowrap small muted">{brDate(row.opened_on)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <div className="stack">
                <Card title="Etapas do caso em foco" subtitle={tracked ? tracked.case_number : undefined}>
                  {tracked ? (
                    <div className="stack">
                      <Progress
                        value={checklist(tracked).filter((i) => i.required && i.done).length}
                        total={checklist(tracked).filter((i) => i.required).length}
                      />
                      <div className="checklist">
                        {checklist(tracked).map((item) => (
                          <div className="check-item" key={item.key}>
                            <span className="check-mark" data-done={item.done}>
                              {item.done ? "✓" : "·"}
                            </span>
                            <span className="label">
                              {item.label}
                              <span className="hint" style={{ display: "block" }}>{item.hint}</span>
                            </span>
                            {!item.done && item.required && (
                              <Link className="btn btn-sm" href={`/casos/${tracked.id}?tab=${item.tab}`}>
                                Abrir
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                      {missingCount(tracked) > 0 && (
                        <Alert tone="warn">
                          {missingCount(tracked)} etapa(s) obrigatória(s) pendente(s) antes do certificado.
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <Empty title="Sem casos em acompanhamento" />
                  )}
                </Card>

                <Card title="Regras aplicadas" subtitle="Referência rápida">
                  <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                    <li>Certificado válido por <strong>6 meses</strong> a partir da CXR.</li>
                    <li>Contato familiar negativo: <strong>3 meses</strong> (UKTBTI v7).</li>
                    <li>Escarro inicia em até <strong>7 dias</strong> da CXR, 3 amostras ≥ 24 h.</li>
                    <li>Laudo radiológico em até <strong>1 dia</strong> útil.</li>
                    <li>Retenção local: <strong>20 anos</strong> do último registro (CFM 1.821/2007).</li>
                    <li>Re-triagem após tratamento: <strong>≥ 6 meses</strong>.</li>
                  </ul>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
