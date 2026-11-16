import type { CaseBundle } from "@/lib/types";
import { salvarIdentidade } from "@/lib/actions/casos";
import { Card, Field } from "@/components/ui";
import { brDateTime } from "@/lib/format";
import { ID_STAGES } from "@/lib/rules";

export function IdentidadeTab({ bundle, canEdit }: { bundle: CaseBundle; canEdit: boolean }) {
  const byStage = new Map(bundle.identity.map((item) => [item.stage, item]));
  const first = bundle.identity[0];

  return (
    <div className="grid grid-side">
      <Card
        title="Verificação de identidade"
        subtitle="Confirme o passaporte em cada etapa do fluxo. O UKVI exige checagem antes de cada procedimento."
      >
        {canEdit ? (
          <form action={salvarIdentidade} className="stack">
            <input type="hidden" name="case_id" value={bundle.detail.id} />
            <div className="form-grid">
              <Field label="Tipo de documento">
                <select name="document_type" defaultValue={first?.document_type ?? "passaporte"}>
                  <option value="passaporte">Passaporte</option>
                  <option value="rnm">RNM / autorização de residência</option>
                  <option value="outro">Outro documento com foto</option>
                </select>
              </Field>
              <Field label="Número do documento conferido">
                <input
                  type="text"
                  name="document_number"
                  className="mono"
                  defaultValue={first?.document_number ?? bundle.applicant.passport_number}
                />
              </Field>
            </div>

            <div>
              <p className="field-label">Estágios conferidos</p>
              <div className="checklist" style={{ marginTop: 6 }}>
                {ID_STAGES.map((stage) => {
                  const current = byStage.get(stage.key);
                  return (
                    <label className="check-item" key={stage.key} style={{ cursor: "pointer" }}>
                      <input type="checkbox" name={`stage_${stage.key}`} value="1" defaultChecked={current?.is_checked} />
                      <span className="label">
                        {stage.label}
                        {current?.is_checked && current.checked_at && (
                          <span className="hint" style={{ display: "block" }}>
                            conferido em {brDateTime(current.checked_at)}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Field label="Observações">
              <textarea name="notes" rows={2} defaultValue={first?.notes ?? ""} />
            </Field>

            <div className="row-end">
              <button className="btn btn-primary" type="submit">Salvar verificações</button>
            </div>
          </form>
        ) : (
          <div className="checklist">
            {ID_STAGES.map((stage) => {
              const current = byStage.get(stage.key);
              return (
                <div className="check-item" key={stage.key}>
                  <span className="check-mark" data-done={!!current?.is_checked}>{current?.is_checked ? "✓" : "·"}</span>
                  <span className="label">
                    {stage.label}
                    <span className="hint" style={{ display: "block" }}>
                      {current?.is_checked && current.checked_at ? brDateTime(current.checked_at) : "não conferido"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Requisitos atendidos" subtitle="Domínio ID da matriz UKVI">
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
          <li>Documento com foto e assinatura conferido no registro.</li>
          <li>Nova conferência antes do exame médico.</li>
          <li>Conferência antes da radiografia.</li>
          <li>Conferência antes da coleta de escarro.</li>
          <li>Conferência antes da entrega do certificado ou encaminhamento.</li>
        </ul>
        <p className="small muted" style={{ marginTop: 12 }}>
          O sistema bloqueia a emissão do certificado quando nenhuma verificação foi registrada.
        </p>
      </Card>
    </div>
  );
}
