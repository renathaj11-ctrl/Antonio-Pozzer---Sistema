import { requireRole } from "@/lib/auth";
import { getAuditLog } from "@/lib/data";
import { Badge, Card, Empty } from "@/components/ui";
import { brDateTime } from "@/lib/format";

export const metadata = { title: "Auditoria" };

const ACTION_TONE: Record<string, "info" | "warn" | "danger" | "neutral"> = {
  INSERT: "info",
  UPDATE: "warn",
  DELETE: "danger",
};

export default async function AuditoriaPage() {
  await requireRole(["admin", "auditor"]);
  const rows = await getAuditLog(150);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Auditoria</h1>
          <p className="sub">Últimas 150 alterações em tabelas clínicas e administrativas.</p>
        </div>
      </header>

      <div className="content stack">
        <Card tight>
          {rows.length === 0 ? (
            <Empty title="Sem registros de auditoria">
              As alterações passam a aparecer aqui assim que a equipe começar a usar o sistema.
            </Empty>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tabela</th>
                    <th>Ação</th>
                    <th>Autor</th>
                    <th>Registro</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="small nowrap">{brDateTime(row.created_at)}</td>
                      <td className="mono small">{row.table_name}</td>
                      <td><Badge tone={ACTION_TONE[row.action] ?? "neutral"}>{row.action}</Badge></td>
                      <td className="small">{row.actor_email ?? "sistema"}</td>
                      <td className="mono small nowrap">{row.row_id ? `${row.row_id.slice(0, 8)}…` : "—"}</td>
                      <td style={{ maxWidth: 360 }}>
                        {row.changed ? (
                          <details>
                            <summary className="small" style={{ cursor: "pointer" }}>ver conteúdo</summary>
                            <pre
                              className="mono"
                              style={{
                                maxHeight: 180,
                                overflow: "auto",
                                whiteSpace: "pre-wrap",
                                fontSize: "0.7rem",
                                background: "#f7f9fa",
                                padding: 8,
                                borderRadius: 6,
                                marginTop: 6,
                              }}
                            >
                              {JSON.stringify(row.changed, null, 1)}
                            </pre>
                          </details>
                        ) : (
                          <span className="muted small">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Sobre a trilha de auditoria">
          <p className="small muted">
            A auditoria é gravada por gatilho no banco (<code>audit_log</code>), não pela aplicação: mesmo
            alterações feitas fora do app ficam registradas. O acesso é restrito a administradores e
            auditores. Os registros não podem ser editados pela aplicação.
          </p>
        </Card>
      </div>
    </>
  );
}
