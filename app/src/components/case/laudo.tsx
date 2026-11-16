import type { CaseBundle } from "@/lib/types";
import { salvarLaudo } from "@/lib/actions/casos";
import { Alert, Badge, Card, Dl, Field } from "@/components/ui";
import { brDate } from "@/lib/format";
import { CXR_RESULT_META, FINDINGS } from "@/lib/rules";

export function LaudoTab({
  bundle,
  canEdit,
  canReview,
}: {
  bundle: CaseBundle;
  canEdit: boolean;
  canReview: boolean;
}) {
  const report = bundle.report;

  return (
    <div className="grid grid-side">
      <Card
        title="Laudo radiológico"
        subtitle="Classificação do achado e revisão obrigatória pelo Panel Physician."
      >
        {canEdit ? (
          <form action={salvarLaudo} className="stack">
            <input type="hidden" name="case_id" value={bundle.detail.id} />

            <div className="form-grid">
              <Field label="Data do laudo">
                <input type="date" name="reported_on" defaultValue={report?.reported_on ?? ""} />
              </Field>
              <Field label="Resultado" hint="Define se há indicação de escarro e o desfecho.">
                <select name="result" defaultValue={report?.result ?? ""}>
                  <option value="">Não classificado</option>
                  {Object.entries(CXR_RESULT_META).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Radiologista">
                <input type="text" name="radiologist_name" defaultValue={report?.radiologist_name ?? ""} />
              </Field>
              <Field label="Registro profissional (CRM/RQE)">
                <input type="text" name="radiologist_registry" defaultValue={report?.radiologist_registry ?? ""} />
              </Field>
            </div>

            <div className="form-grid">
              <div className="stack-sm">
                <label className="check">
                  <input type="checkbox" name="compared_previous" value="1" defaultChecked={report?.compared_previous} />
                  <span><strong>Comparado com exame anterior</strong></span>
                </label>
                <Field label="Referência do exame anterior">
                  <input type="text" name="previous_reference" defaultValue={report?.previous_reference ?? ""} />
                </Field>
              </div>
              <Field label="Descrição do laudo" className="span-2">
                <textarea name="description" rows={4} defaultValue={report?.description ?? ""} />
              </Field>
            </div>

            <div>
              <p className="field-label">Achados codificados</p>
              <div className="stack" style={{ gap: 10, marginTop: 6 }}>
                {FINDINGS.map((group) => (
                  <div key={group.group}>
                    <p className="small muted" style={{ marginBottom: 4 }}>{group.group}</p>
                    <div className="check-grid">
                      {group.codes.map(([code, label]) => (
                        <label className="check" key={code}>
                          <input
                            type="checkbox"
                            name="findings_codes"
                            value={code}
                            defaultChecked={report?.findings_codes.includes(code)}
                          />
                          <span><span className="mono">{code}</span> {label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div>
              <p className="field-label">Revisão do Panel Physician</p>
              {canReview ? (
                <div className="stack-sm" style={{ marginTop: 6 }}>
                  <label className="check">
                    <input type="checkbox" name="pp_reviewed" value="1" defaultChecked={report?.pp_reviewed} />
                    <span><strong>Laudo revisado e aceito pelo Panel Physician</strong></span>
                  </label>
                  <div className="form-grid">
                    <Field label="Data da revisão">
                      <input type="date" name="pp_reviewed_on" defaultValue={report?.pp_reviewed_on ?? ""} />
                    </Field>
                    <Field label="Observações da revisão">
                      <input type="text" name="pp_review_notes" defaultValue={report?.pp_review_notes ?? ""} />
                    </Field>
                  </div>
                </div>
              ) : (
                <>
                  <input type="hidden" name="pp_reviewed" value={report?.pp_reviewed ? "1" : "0"} />
                  <input type="hidden" name="pp_reviewed_on" value={report?.pp_reviewed_on ?? ""} />
                  <input type="hidden" name="pp_review_notes" value={report?.pp_review_notes ?? ""} />
                  <p className="note" style={{ marginTop: 6 }}>
                    {report?.pp_reviewed
                      ? `Revisado pelo Panel Physician${report.pp_reviewed_on ? ` em ${brDate(report.pp_reviewed_on)}` : ""}.`
                      : "A revisão e o aceite do laudo são feitos pelo Panel Physician."}
                  </p>
                </>
              )}
            </div>

            <div className="row-end">
              <button className="btn btn-primary" type="submit">Salvar laudo</button>
            </div>
          </form>
        ) : (
          <Dl
            items={[
              { label: "Data", value: brDate(report?.reported_on) },
              { label: "Resultado", value: report?.result ? CXR_RESULT_META[report.result] : "Não classificado" },
              { label: "Radiologista", value: report?.radiologist_name ?? "—" },
              { label: "Registro", value: report?.radiologist_registry ?? "—" },
              { label: "Achados", value: report?.findings_codes.length ? report.findings_codes.join(", ") : "—" },
              { label: "Descrição", value: report?.description ?? "—" },
              { label: "Comparado", value: report?.compared_previous ? report.previous_reference ?? "Sim" : "Não" },
              { label: "Revisão PP", value: report?.pp_reviewed ? `Sim${report.pp_reviewed_on ? ` em ${brDate(report.pp_reviewed_on)}` : ""}` : "Pendente" },
            ]}
          />
        )}
      </Card>

      <div className="stack">
        <Card title="Classificação">
          <div className="stack-sm">
            {Object.entries(CXR_RESULT_META).map(([value, label]) => (
              <div className="check-item" key={value}>
                <span className="check-mark" data-done={report?.result === value}>{report?.result === value ? "✓" : "·"}</span>
                <span className="label">
                  {label}
                  <span className="hint" style={{ display: "block" }}>
                    {value === "normal" && "Sem achados; certificado liberado após revisão do PP."}
                    {value === "achado_nao_tb" && "Achado sem relação com TB; certificado liberado após revisão."}
                    {value === "tb_ativa_ou_antiga" && "Exige escarro (3 amostras) e laudo final negativo."}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {report?.result === "tb_ativa_ou_antiga" && (
          <Alert tone="warn">
            Resultado compatível com TB ativa ou antiga: escarro obrigatório. O certificado só é liberado
            com laudo final negativo e revisão do PP.
          </Alert>
        )}

        {report?.pp_reviewed && (
          <Card title="Revisão registrada">
            <div className="pill-row">
              <Badge tone="ok">laudo revisado</Badge>
              {report.result && <Badge tone="info">{CXR_RESULT_META[report.result]}</Badge>}
            </div>
            {report.pp_review_notes && <p className="small muted" style={{ marginTop: 10 }}>{report.pp_review_notes}</p>}
          </Card>
        )}

        <Card title="Prazos e exigências">
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Laudo emitido em até 1 dia útil após a CXR.</li>
            <li>Revisão do Panel Physician antes da emissão do certificado.</li>
            <li>Escarro: iniciar em até 7 dias da CXR; 3 amostras com ≥ 24 h de intervalo.</li>
            <li>Resultado final do escarro em até 10 semanas.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
