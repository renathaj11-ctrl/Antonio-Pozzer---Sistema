import type { CaseBundle } from "@/lib/types";
import { salvarConsentimento } from "@/lib/actions/casos";
import { Card, Dl, Field } from "@/components/ui";
import { brDate } from "@/lib/format";

export function ConsentimentoTab({ bundle, canEdit }: { bundle: CaseBundle; canEdit: boolean }) {
  const consent = bundle.consent;
  const pregnant = bundle.detail.category === "gestante";

  return (
    <div className="grid grid-side">
      <Card
        title="Consentimento informado"
        subtitle="Exigido antes de qualquer procedimento. Registre a via assinada em Documentos."
      >
        {canEdit ? (
          <form action={salvarConsentimento} className="stack">
            <input type="hidden" name="case_id" value={bundle.detail.id} />

            <label className="check">
              <input type="checkbox" name="signed" value="1" defaultChecked={consent?.signed} />
              <span>
                <strong>Consentimento assinado pelo requerente</strong>
                <span className="muted small" style={{ display: "block" }}>
                  O requerente declarou ter lido e compreendido o formulário.
                </span>
              </span>
            </label>

            <div className="form-grid">
              <Field label="Data da assinatura">
                <input type="date" name="signed_on" defaultValue={consent?.signed_on ?? ""} />
              </Field>
              <Field label="Versão do formulário" hint="Use a versão vigente do formulário de consentimento.">
                <input type="text" name="form_version" defaultValue={consent?.form_version ?? ""} placeholder="Ex.: UKTB-CONS-v7" />
              </Field>
              <Field label="Idioma">
                <select name="language" defaultValue={consent?.language ?? "Português"}>
                  <option value="Português">Português</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Outro">Outro</option>
                </select>
              </Field>
              <Field label="Explicado por">
                <input type="text" name="explained_by" defaultValue={consent?.explained_by ?? ""} />
              </Field>
              <Field label="Intérprete (se aplicável)">
                <input type="text" name="interpreter_name" defaultValue={consent?.interpreter_name ?? ""} />
              </Field>
              <Field
                label="Conduta para gestante"
                hint="Aplicável apenas quando a requerente está grávida."
              >
                <select name="pregnant_option" defaultValue={consent?.pregnant_option ?? ""}>
                  <option value="">Não se aplica</option>
                  <option value="adiar">Adiar o exame</option>
                  <option value="escarro">Coleta de escarro</option>
                  <option value="cxr_dupla_protecao">CXR com dupla proteção</option>
                  <option value="na">Gestante — sem opção registrada</option>
                </select>
              </Field>
              <Field label="Retirada do consentimento em">
                <input type="date" name="withdrawal_on" defaultValue={consent?.withdrawal_on ?? ""} />
              </Field>
              <Field label="Motivo da retirada">
                <input type="text" name="withdrawal_reason" defaultValue={consent?.withdrawal_reason ?? ""} />
              </Field>
            </div>

            {pregnant && (
              <p className="note">
                Gestante: registrar a decisão informada (adiar, escarro ou CXR com dupla proteção) e a
                justificativa clínica no prontuário.
              </p>
            )}

            <div className="row-end">
              <button className="btn btn-primary" type="submit">Salvar consentimento</button>
            </div>
          </form>
        ) : (
          <Dl
            items={[
              { label: "Assinado", value: consent?.signed ? "Sim" : "Não" },
              { label: "Data", value: brDate(consent?.signed_on) },
              { label: "Versão", value: consent?.form_version ?? "—" },
              { label: "Idioma", value: consent?.language ?? "—" },
              { label: "Explicado por", value: consent?.explained_by ?? "—" },
              { label: "Intérprete", value: consent?.interpreter_name ?? "—" },
              { label: "Conduta gestante", value: consent?.pregnant_option ?? "—" },
              { label: "Retirada", value: consent?.withdrawal_on ? brDate(consent.withdrawal_on) : "—" },
            ]}
          />
        )}
      </Card>

      <Card title="Por que isso importa" subtitle="LGPD e regras UKVI">
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
          <li>Consentimento livre, informado e específico para o exame e o envio do resultado ao UKVI.</li>
          <li>Sem consentimento, a emissão do certificado é bloqueada no banco de dados.</li>
          <li>Registre a versão do formulário para rastreabilidade em auditoria.</li>
          <li>A retirada do consentimento deve ser registrada com data e motivo.</li>
        </ul>
        <p className="note" style={{ marginTop: 12 }}>
          A base legal para o envio do resultado ao UKVI é o consentimento do requerente, somado à
          obrigação legal do processo de visto.
        </p>
      </Card>
    </div>
  );
}
