import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { listCases } from "@/lib/data";
import { age, brDate, maskPassport } from "@/lib/format";
import { STATUS_META, nextAction, missingCount, needsSputum } from "@/lib/rules";
import { Badge, Card, Empty } from "@/components/ui";
import type { Tone } from "@/components/ui";

export const metadata = { title: "Casos" };

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CasosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireProfile();
  const sp = await searchParams;
  const q = first(sp.q);
  const status = first(sp.status);
  const ano = first(sp.ano);

  const rows = await listCases({ q: q || undefined, status: status || undefined, ano: ano || undefined });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i));

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Casos</h1>
          <p className="sub">{rows.length} registro(s) encontrado(s)</p>
        </div>
        <div className="topbar-actions">
          <Link className="btn btn-primary" href="/casos/novo">+ Novo caso</Link>
        </div>
      </header>

      <div className="content stack">
        <Card>
          <form method="get" className="row" style={{ alignItems: "flex-end" }}>
            <label className="field" style={{ flex: "2 1 240px" }}>
              <span>Buscar</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Nome, número do caso ou passaporte"
              />
            </label>
            <label className="field" style={{ flex: "0 1 190px" }}>
              <span>Status</span>
              <select name="status" defaultValue={status}>
                <option value="">Todos</option>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>{meta.label}</option>
                ))}
              </select>
            </label>
            <label className="field" style={{ flex: "0 1 120px" }}>
              <span>Ano</span>
              <select name="ano" defaultValue={ano}>
                <option value="">Todos</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary" type="submit">Filtrar</button>
            {(q || status || ano) && (
              <Link className="btn btn-ghost" href="/casos">Limpar</Link>
            )}
          </form>
        </Card>

        <Card tight>
          {rows.length === 0 ? (
            <Empty title="Nenhum caso encontrado">
              Ajuste os filtros ou abra um novo caso.
            </Empty>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Caso</th>
                    <th>Requerente</th>
                    <th>Passaporte</th>
                    <th>Status</th>
                    <th>Próxima ação</th>
                    <th>Pendências</th>
                    <th>Abertura</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const meta = STATUS_META[row.status];
                    const action = nextAction(row);
                    const missing = missingCount(row);
                    const sputumPending = needsSputum(row) && row.sputum_status !== "negativo" && row.sputum_status !== "positivo";
                    return (
                      <tr key={row.id} className="clickable">
                        <td className="mono nowrap">
                          <Link href={`/casos/${row.id}`}>{row.case_number}</Link>
                        </td>
                        <td>
                          <Link href={`/casos/${row.id}`} className="primary" style={{ color: "inherit" }}>
                            {row.full_name}
                          </Link>
                          <div className="sub">
                            {age(row.date_of_birth)}
                            {row.category === "gestante" && " · gestante"}
                            {row.category === "crianca" && " · criança"}
                          </div>
                        </td>
                        <td className="mono small nowrap">{maskPassport(row.passport_number)}</td>
                        <td><Badge tone={meta.tone as Tone}>{meta.label}</Badge></td>
                        <td>
                          <Link href={`/casos/${row.id}?tab=${action.tab}`} className="small">
                            {action.label}
                          </Link>
                        </td>
                        <td>
                          <div className="row" style={{ gap: 4 }}>
                            {missing > 0 && <Badge tone="warn">{missing} pendente(s)</Badge>}
                            {sputumPending && <Badge tone="danger">escarro</Badge>}
                            {missing === 0 && !sputumPending && <Badge tone="ok">em dia</Badge>}
                          </div>
                        </td>
                        <td className="small muted nowrap">{brDate(row.opened_on)}</td>
                        <td className="right">
                          <Link className="btn btn-sm" href={`/casos/${row.id}`}>Abrir</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
