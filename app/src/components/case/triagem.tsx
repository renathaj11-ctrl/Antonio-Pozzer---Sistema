import type { CaseBundle } from "@/lib/types";
import { salvarTriagem } from "@/lib/actions/casos";
import { Card, Dl, Field } from "@/components/ui";
import { brDate } from "@/lib/format";
import { SYMPTOMS } from "@/lib/rules";

export function TriagemTab({ bundle, canEdit }: { bundle: CaseBundle; canEdit: boolean }) {
  const screening = bundle.screening;
  const isChild = bundle.detail.category === "crianca";

  return (
    <div className="grid grid-side">
      <Card
        title="Triagem clínica"
        subtitle="Sintomas, história de TB e decisão sobre a necessidade de radiografia."
      >
        {canEdit ? (
          <form action={salvarTriagem} className="stack">
            <input type="hidden" name="case_id" value={bundle.detail.id} />

            <div className="form-grid">
              <Field label="Data da triagem">
                <input type="date" name="screened_on" defaultValue={screening?.screened_on ?? bundle.detail.assessment_date ?? ""} />
              </Field>
              <Field label="Decisão clínica" hint="Ex.: prosseguir com CXR; adiar; encaminhar.">
                <input type="text" name="clinical_decision" defaultValue={screening?.clinical_decision ?? ""} />
              </Field>
            </div>

            <div>
              <p className="field-label">Sintomas</p>
              <div className="check-grid" style={{ marginTop: 6 }}>
                {SYMPTOMS.map((symptom) => (
                  <label className="check" key={symptom}>
                    <input
                      type="checkbox"
                      name="symptoms"
                      value={symptom}
                      defaultChecked={screening?.symptoms.includes(symptom)}
                    />
                    <span>{symptom}</span>
                  </label>
                ))}
              </div>
              <Field label="Detalhes dos sintomas" hint="Duração, intensidade, hemoptise, febre, sudorese noturna.">
                <textarea name="symptom_details" rows={2} defaultValue={screening?.symptom_details ?? ""} />
              </Field>
            </div>

            <div className="divider" />

            <label className="check">
              <input type="checkbox" name="previous_tb" value="1" defaultChecked={screening?.previous_tb} />
              <span><strong>História prévia de TB</strong></span>
            </label>
            <Field label="Detalhes da TB prévia" hint="Ano, tratamento, duração e desfecho.">
              <textarea name="previous_tb_details" rows={2} defaultValue={screening?.previous_tb_details ?? ""} />
            </Field>

            <div className="form-grid">
              <div className="stack-sm">
                <label className="check">
                  <input type="checkbox" name="contact_tb" value="1" defaultChecked={screening?.contact_tb} />
                  <span><strong>Contato com TB</strong></span>
                </label>
                <label className="check">
                  <input type="checkbox" name="household_tb" value="1" defaultChecked={screening?.household_tb} />
                  <span><strong>Contato domiciliar</strong></span>
                </label>
              </div>
              <Field label="Detalhes do contato" hint="Quem, quando, vínculo e se houve tratamento.">
                <textarea name="contact_details" rows={2} defaultValue={screening?.contact_details ?? ""} />
              </Field>
            </div>

            <div className="divider" />

            <div className="form-grid">
              <Field label="Exame físico" className="span-2">
                <textarea name="physical_exam" rows={2} defaultValue={screening?.physical_exam ?? ""} />
              </Field>
              <div className="stack-sm">
                <label className="check">
                  <input type="checkbox" name="pregnant" value="1" defaultChecked={screening?.pregnant} />
                  <span><strong>Gestante</strong></span>
                </label>
                <Field label="DUM (se gestante)">
                  <input type="date" name="lmp" defaultValue={screening?.lmp ?? ""} />
                </Field>
              </div>
              <div className="stack-sm">
                <label className="check">
                  <input type="checkbox" name="xray_required" value="1" defaultChecked={screening?.xray_required ?? true} />
                  <span><strong>Radiografia de tórax indicada</strong></span>
                </label>
                <Field label="Se não indicada, justifique" hint="A não realização precisa de justificativa clínica registrada.">
                  <input type="text" name="xray_not_required_reason" defaultValue={screening?.xray_not_required_reason ?? ""} />
                </Field>
              </div>
            </div>

            <div className="row-end">
              <button className="btn btn-primary" type="submit">Salvar triagem</button>
            </div>
          </form>
        ) : (
          <Dl
            items={[
              { label: "Data", value: brDate(screening?.screened_on) },
              { label: "Sintomas", value: screening?.symptoms.length ? screening.symptoms.join(", ") : "Nenhum relatado" },
              { label: "Detalhes", value: screening?.symptom_details ?? "—" },
              { label: "TB prévia", value: screening?.previous_tb ? "Sim" : "Não" },
              { label: "Detalhes TB prévia", value: screening?.previous_tb_details ?? "—" },
              { label: "Contato com TB", value: screening?.contact_tb ? "Sim" : "Não" },
              { label: "Contato domiciliar", value: screening?.household_tb ? "Sim" : "Não" },
              { label: "Exame físico", value: screening?.physical_exam ?? "—" },
              { label: "Gestante", value: screening?.pregnant ? `Sim${screening.lmp ? ` (DUM ${brDate(screening.lmp)})` : ""}` : "Não" },
              { label: "CXR indicada", value: screening?.xray_required ? "Sim" : `Não — ${screening?.xray_not_required_reason ?? "sem justificativa"}` },
              { label: "Decisão clínica", value: screening?.clinical_decision ?? "—" },
            ]}
          />
        )}
      </Card>

      <div className="stack">
        <Card title="Regras de triagem">
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Perguntar ativamente sobre tosse &gt; 2 semanas, hemoptise, perda de peso, febre e sudorese noturna.</li>
            <li>História de TB tratada exige CXR e comparação com exames anteriores.</li>
            <li>Contato domiciliar de caso bacilífero: atenção à validade de 3 meses do certificado (v7).</li>
            <li>Gestante: decidir entre adiar, escarro ou CXR com dupla proteção.</li>
            <li>Criança &lt; 11 anos: seguir fluxo pediátrico específico (CXR e, se indicado, escarro).</li>
          </ul>
        </Card>

        {isChild && (
          <Card title="Criança menor de 11 anos">
            <p className="small muted">
              O escarro é difícil de obter; priorize CXR e avaliação clínica. Se houver suspeita, o caso
              deve ser encaminhado para avaliação pediátrica especializada. Registre o contato familiar
              e o resultado da investigação.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
