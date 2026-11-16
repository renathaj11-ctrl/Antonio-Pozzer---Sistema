import type { CaseBundle } from "@/lib/types";
import { salvarEscarro } from "@/lib/actions/casos";
import { Alert, Badge, Card, Dl, Field } from "@/components/ui";
import { brDate, brDateTime, daysBetween } from "@/lib/format";

const RESULTS = [
  { value: "", label: "Não informado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "negativo", label: "Negativo" },
  { value: "positivo", label: "Positivo" },
  { value: "inconclusivo", label: "Inconclusivo" },
];

export function EscarroTab({ bundle, canEdit }: { bundle: CaseBundle; canEdit: boolean }) {
  const sputum = bundle.sputum;
  const overview = bundle.overview;
  const required = sputum?.required ?? overview?.sputum_required ?? false;
  const deadline = overview?.sputum_deadline ?? null;
  const days = daysBetween(deadline);
  const samples = sputum?.samples ?? [];

  return (
    <div className="grid grid-side">
      <Card
        title="Exame de escarro"
        subtitle="Indicado quando a CXR é compatível com TB ativa ou antiga, ou por decisão clínica."
      >
        {canEdit ? (
          <form action={salvarEscarro} className="stack">
            <input type="hidden" name="case_id" value={bundle.detail.id} />

            <label className="check">
              <input type="checkbox" name="required" value="1" defaultChecked={required} />
              <span><strong>Escarro indicado neste caso</strong></span>
            </label>

            <div className="form-grid">
              <Field label="Motivo da indicação" className="span-2">
                <input type="text" name="reason" defaultValue={sputum?.reason ?? ""} />
              </Field>
              <Field label="Início planejado" hint={deadline ? `Prazo máximo: ${brDate(deadline)} (7 dias após a CXR).` : "Depende da data da CXR."}>
                <input type="date" name="planned_start_on" defaultValue={sputum?.planned_start_on ?? ""} />
              </Field>
              <Field label="Início efetivo">
                <input type="date" name="started_on" defaultValue={sputum?.started_on ?? ""} />
              </Field>
            </div>

            <div>
              <p className="field-label">Amostras (3 coletas, intervalo mínimo de 24 h)</p>
              <div className="stack-sm" style={{ marginTop: 6 }}>
                {[1, 2, 3].map((n) => {
                  const sample = samples[n - 1];
                  return (
                    <div className="row" key={n} style={{ alignItems: "flex-end", gap: 10 }}>
                      <span className="badge badge-neutral" style={{ marginBottom: 9 }}>#{n}</span>
                      <label className="field" style={{ flex: "1 1 130px" }}>
                        <span>Data</span>
                        <input type="date" name={`sample_date_${n}`} defaultValue={sample?.date ?? ""} />
                      </label>
                      <label className="field" style={{ flex: "0 1 110px" }}>
                        <span>Hora</span>
                        <input type="time" name={`sample_time_${n}`} defaultValue={sample?.time ?? ""} />
                      </label>
                      <label className="field" style={{ flex: "0 1 100px" }}>
                        <span>Volume (mL)</span>
                        <input type="text" name={`sample_volume_${n}`} defaultValue={sample?.volume_ml ?? ""} />
                      </label>
                      <label className="field" style={{ flex: "1 1 150px" }}>
                        <span>Qualidade</span>
                        <select name={`sample_quality_${n}`} defaultValue={sample?.quality ?? ""}>
                          <option value="">—</option>
                          <option value="adequada">Adequada</option>
                          <option value="saliva">Saliva</option>
                          <option value="insuficiente">Insuficiente</option>
                        </select>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-grid">
              <Field label="Laboratório">
                <input type="text" name="lab_name" defaultValue={sputum?.lab_name ?? ""} />
              </Field>
              <Field label="Acreditação do laboratório">
                <input type="text" name="lab_accreditation" defaultValue={sputum?.lab_accreditation ?? ""} />
              </Field>
              <Field label="Enviado em">
                <input type="date" name="sent_at" defaultValue={sputum?.sent_at?.slice(0, 10) ?? ""} />
              </Field>
              <Field label="Recebido no laboratório">
                <input type="date" name="received_at" defaultValue={sputum?.received_at?.slice(0, 10) ?? ""} />
              </Field>
              <Field label="Processado em">
                <input type="date" name="processed_at" defaultValue={sputum?.processed_at?.slice(0, 10) ?? ""} />
              </Field>
              <Field label="Resultado da baciloscopia">
                <select name="microscopy_result" defaultValue={sputum?.microscopy_result ?? ""}>
                  {RESULTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
              <Field label="Resultado da cultura">
                <select name="culture_result" defaultValue={sputum?.culture_result ?? ""}>
                  {RESULTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
              <Field label="Teste de sensibilidade (DST)">
                <input type="text" name="dst_result" defaultValue={sputum?.dst_result ?? ""} />
              </Field>
              <Field label="Laudo final em" hint="Necessário para liberar o certificado.">
                <input type="date" name="final_report_on" defaultValue={sputum?.final_report_on ?? ""} />
              </Field>
              <Field label="Notificação de positivo em">
                <input type="date" name="positive_notified_on" defaultValue={sputum?.positive_notified_on?.slice(0, 10) ?? ""} />
              </Field>
              <Field label="Observações" className="span-2">
                <textarea name="notes" rows={2} defaultValue={sputum?.notes ?? ""} />
              </Field>
            </div>

            <div className="row-end">
              <button className="btn btn-primary" type="submit">Salvar escarro</button>
            </div>
          </form>
        ) : (
          <Dl
            items={[
              { label: "Indicado", value: required ? "Sim" : "Não" },
              { label: "Motivo", value: sputum?.reason ?? "—" },
              { label: "Início", value: brDate(sputum?.started_on) },
              { label: "Amostras", value: `${samples.length} registrada(s)` },
              { label: "Baciloscopia", value: sputum?.microscopy_result ?? "—" },
              { label: "Cultura", value: sputum?.culture_result ?? "—" },
              { label: "DST", value: sputum?.dst_result ?? "—" },
              { label: "Laudo final", value: brDate(sputum?.final_report_on) },
              { label: "Positivo notificado", value: sputum?.positive_notified_on ? brDateTime(sputum.positive_notified_on) : "—" },
            ]}
          />
        )}
      </Card>

      <div className="stack">
        <Card title="Situação">
          <div className="pill-row">
            <Badge tone={required ? "warn" : "neutral"}>{required ? "indicado" : "não indicado"}</Badge>
            {overview?.sputum_status && (
              <Badge tone={overview.sputum_status === "negativo" ? "ok" : overview.sputum_status === "positivo" ? "danger" : "info"}>
                {overview.sputum_status === "negativo" ? "laudo negativo" : overview.sputum_status === "positivo" ? "positivo" : "em andamento"}
              </Badge>
            )}
            {overview?.sputum_started_on && <Badge tone="neutral">iniciado {brDate(overview.sputum_started_on)}</Badge>}
          </div>
        </Card>

        {deadline && (
          <Alert tone={days !== null && days < 0 ? "danger" : days !== null && days <= 2 ? "warn" : "info"}>
            <strong>Prazo do escarro: {brDate(deadline)}.</strong>{" "}
            {days === null
              ? ""
              : days < 0
                ? `Vencido há ${Math.abs(days)} dia(s).`
                : `Faltam ${days} dia(s).`}
            {" "}Início deve ocorrer em até 7 dias da CXR.
          </Alert>
        )}

        <Card title="Exigências do exame">
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>3 amostras de escarro, com pelo menos 24 h de intervalo.</li>
            <li>Uma amostra preferencialmente matinal.</li>
            <li>Baciloscopia e cultura; DST quando positivo.</li>
            <li>Laudo final em até 10 semanas da coleta.</li>
            <li>Positivo: notificar a autoridade local e o UKHSA, e encaminhar para tratamento.</li>
          </ul>
        </Card>

        {overview?.sputum_status === "positivo" && (
          <Alert tone="danger">
            <strong>Positivo.</strong> Não emitir certificado. Registrar encaminhamento, notificação local
            e comunicação ao UKHSA.
          </Alert>
        )}
      </div>
    </div>
  );
}
