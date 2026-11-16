import type { CaseBundle } from "@/lib/types";
import { Badge, Card, Empty } from "@/components/ui";
import { brDateTime } from "@/lib/format";

const EVENT_TONE: Record<string, "info" | "ok" | "warn" | "danger" | "neutral"> = {
  caso_criado: "info",
  dados_atualizados: "neutral",
  status: "neutral",
  identidade: "info",
  consentimento: "info",
  triagem: "info",
  cxr: "info",
  laudo: "info",
  escarro: "warn",
  certificado: "ok",
  encaminhamento: "danger",
  tratamento: "danger",
  documento: "neutral",
};

export function HistoricoTab({ bundle }: { bundle: CaseBundle }) {
  return (
    <div className="grid grid-side">
      <Card title="Linha do tempo" subtitle="Registros gerados automaticamente pelas ações no caso.">
        {bundle.events.length === 0 ? (
          <Empty title="Sem eventos registrados" />
        ) : (
          <div className="timeline">
            {bundle.events.map((event) => (
              <div className="timeline-item" key={event.id}>
                <span className="timeline-dot" />
                <div className="timeline-body">
                  <div className="row" style={{ gap: 8 }}>
                    <Badge tone={EVENT_TONE[event.event_type] ?? "neutral"}>{event.event_type}</Badge>
                    <time>{brDateTime(event.created_at)}</time>
                  </div>
                  <p style={{ marginTop: 2 }}>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="stack">
        <Card title="Auditoria">
          <p className="small muted">
            Toda alteração em tabelas clínicas é gravada em <code>audit_log</code> com autor, data/hora e
            o conteúdo alterado. O histórico acima é a visão operacional; a auditoria completa fica
            disponível para administradores e auditores em <strong>Auditoria</strong>.
          </p>
        </Card>
        <Card title="Prontuário">
          <p className="small muted">
            Registros clínicos são imutáveis por política: não há exclusão via aplicação. Correções são
            feitas por novo lançamento, preservando o histórico.
          </p>
        </Card>
      </div>
    </div>
  );
}
