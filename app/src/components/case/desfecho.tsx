import Link from "next/link";
import type { CaseBundle } from "@/lib/types";
import {
  alterarStatus,
  emitirCertificado,
  registrarEncaminhamento,
  registrarNaoEmissao,
  salvarTratamento,
} from "@/lib/actions/casos";
import { Alert, Badge, Card, Dl, Field } from "@/components/ui";
import { brDate, todayISO } from "@/lib/format";
import { certificateBlockers, certificateExpiry } from "@/lib/rules";

const NOT_ISSUED = [
  { value: "tb_confirmada_ou_suspeita", label: "TB confirmada ou suspeita" },
  { value: "teste_adiado", label: "Teste adiado" },
  { value: "desistencia", label: "Desistência do requerente" },
  { value: "processo_incompleto", label: "Processo incompleto" },
];

export function DesfechoTab({
  bundle,
  canIssue,
  canEdit,
}: {
  bundle: CaseBundle;
  canIssue: boolean;
  canEdit: boolean;
}) {
  const overview = bundle.overview;
  const blockers = overview ? certificateBlockers(overview) : [];
  const issued = bundle.certificates.find((certificate) => certificate.issued) ?? null;
  const lastNotIssued = bundle.certificates.find((certificate) => !certificate.issued) ?? null;
  const canIssueNow = canIssue && !!overview && blockers.length === 0 && !overview.certificate_issued;
  const cxrOn = overview?.cxr_on ?? null;
  const suggestedExpiry = cxrOn ? certificateExpiry(cxrOn) : "";

  return (
    <div className="grid grid-side">
      <div className="stack">
        {issued ? (
          <Card title="Certificado emitido" subtitle="Documento imutável. Corrija por retificação formal, não por edição.">
            <Dl
              items={[
                { label: "Número", value: <span className="mono">{issued.number ?? "—"}</span> },
                { label: "Emissão", value: brDate(issued.issued_on) },
                { label: "Validade", value: brDate(issued.expires_on) },
                { label: "Após escarro", value: issued.after_sputum ? "Sim" : "Não" },
                { label: "PETS/referência", value: issued.pets_reference ?? "—" },
                { label: "Comentários", value: issued.comments ?? "—" },
              ]}
            />
            <Alert tone="ok">
              <strong>Desfecho concluído.</strong> A validade é contada a partir da data da CXR.
            </Alert>
            <div className="row" style={{ marginTop: 12 }}>
              <Link className="btn btn-sm" href={`/casos/${bundle.detail.id}?tab=documentos`}>
                Anexar via assinada do certificado
              </Link>
            </div>
          </Card>
        ) : (
          <Card
            title="Emitir certificado de triagem"
            subtitle="Só é permitido quando todas as etapas obrigatórias estão concluídas."
          >
            {!canIssue ? (
              <Alert tone="info">
                Apenas o Panel Physician (médico) ou o administrador pode emitir certificados.
              </Alert>
            ) : (
              <form action={emitirCertificado} className="stack">
                <input type="hidden" name="case_id" value={bundle.detail.id} />

                {blockers.length > 0 ? (
                  <Alert tone="danger">
                    <strong>Certificado bloqueado por {blockers.length} pendência(s):</strong>
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                      {blockers.map((blocker) => (
                        <li key={blocker.key}>
                          {blocker.message}{" "}
                          <Link href={`/casos/${bundle.detail.id}?tab=${blocker.tab}`} className="small">resolver</Link>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                ) : (
                  <Alert tone="ok">Todas as etapas obrigatórias foram concluídas. Certificado liberado.</Alert>
                )}

                <div className="form-grid">
                  <Field label="Número do certificado">
                    <input
                      type="text"
                      name="number"
                      className="mono"
                      defaultValue={`${bundle.detail.case_number}-C${bundle.certificates.length + 1}`}
                    />
                  </Field>
                  <Field label="Data de emissão" required>
                    <input type="date" name="issued_on" defaultValue={todayISO()} required />
                  </Field>
                  <Field label="Válido até" hint="6 meses a partir da CXR (3 meses para contato familiar negativo — v7).">
                    <input type="date" name="expires_on" defaultValue={suggestedExpiry} />
                  </Field>
                  <Field label="Referência PETS / UKVI">
                    <input type="text" name="pets_reference" defaultValue="" />
                  </Field>
                </div>

                <label className="check">
                  <input type="checkbox" name="after_sputum" value="1" defaultChecked={overview?.sputum_required} />
                  <span><strong>Certificado emitido após laudo negativo de escarro</strong></span>
                </label>

                <Field label="Comentários">
                  <textarea name="comments" rows={2} />
                </Field>

                <div className="row-end">
                  <button className="btn btn-ok" type="submit" disabled={!canIssueNow}>
                    Emitir certificado
                  </button>
                </div>
              </form>
            )}
          </Card>
        )}

        {canEdit && (
          <Card title="Encaminhamento para tratamento" subtitle="Use quando houver TB confirmada ou suspeita.">
            <form action={registrarEncaminhamento} className="stack">
              <input type="hidden" name="case_id" value={bundle.detail.id} />
              <div className="form-grid">
                <Field label="Data do encaminhamento">
                  <input type="date" name="referred_on" defaultValue={todayISO()} />
                </Field>
                <div>
                  <p className="field-label">Motivos</p>
                  <div className="check-grid">
                    {["TB confirmada", "Suspeita de TB", "Escarro positivo", "Avaliação especializada"].map((reason) => (
                      <label className="check" key={reason}>
                        <input type="checkbox" name="reason" value={reason} />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <label className="check">
                <input type="checkbox" name="advised_treatment" value="1" />
                <span><strong>Requerente orientado a iniciar tratamento</strong></span>
              </label>

              <div className="form-grid">
                <div className="stack-sm">
                  <label className="check">
                    <input type="checkbox" name="local_notified" value="1" />
                    <span><strong>Autoridade local notificada</strong></span>
                  </label>
                  <Field label="Data da notificação local">
                    <input type="date" name="local_notified_on" />
                  </Field>
                </div>
                <div className="stack-sm">
                  <label className="check">
                    <input type="checkbox" name="uk_notified" value="1" />
                    <span><strong>UKHSA notificado</strong></span>
                  </label>
                  <Field label="Data da notificação ao UKHSA">
                    <input type="date" name="uk_notified_on" />
                  </Field>
                </div>
              </div>

              <div className="row-end">
                <button className="btn btn-danger" type="submit">Registrar encaminhamento</button>
              </div>
            </form>
          </Card>
        )}

        {canEdit && (
          <Card title="Tratamento" subtitle="Acompanhamento pós-encaminhamento e re-triagem.">
            <form action={salvarTratamento} className="stack">
              <input type="hidden" name="case_id" value={bundle.detail.id} />
              <div className="form-grid">
                <Field label="Serviço / provedor">
                  <input type="text" name="provider" defaultValue={bundle.treatment?.provider ?? ""} />
                </Field>
                <Field label="Esquema">
                  <input type="text" name="regimen" defaultValue={bundle.treatment?.regimen ?? ""} />
                </Field>
                <Field label="Início">
                  <input type="date" name="started_on" defaultValue={bundle.treatment?.started_on ?? ""} />
                </Field>
                <Field label="Término">
                  <input type="date" name="ended_on" defaultValue={bundle.treatment?.ended_on ?? ""} />
                </Field>
                <Field label="Adesão">
                  <select name="adherence" defaultValue={bundle.treatment?.adherence ?? ""}>
                    <option value="">Não avaliada</option>
                    <option value="completa">Completa</option>
                    <option value="parcial">Parcial</option>
                    <option value="interrompida">Interrompida</option>
                  </select>
                </Field>
                <Field label="Desfecho">
                  <input type="text" name="outcome" defaultValue={bundle.treatment?.outcome ?? ""} />
                </Field>
              </div>
              <p className="note">
                Após o término do tratamento, nova triagem só pode ocorrer após 6 meses. Registre a data
                de término para monitorar esse intervalo.
              </p>
              <div className="row-end">
                <button className="btn" type="submit">Salvar tratamento</button>
              </div>
            </form>
          </Card>
        )}

        {canEdit && (
          <Card title="Encerrar caso" subtitle="Use quando não há certificado nem tratamento pendente.">
            <form action={alterarStatus} className="row">
              <input type="hidden" name="case_id" value={bundle.detail.id} />
              <input type="hidden" name="status" value="encerrado" />
              <button className="btn" type="submit">Encerrar caso</button>
            </form>
          </Card>
        )}
      </div>

      <div className="stack">
        <Card title="Desfechos registrados">
          {bundle.certificates.length === 0 ? (
            <p className="muted small">Nenhum desfecho registrado.</p>
          ) : (
            <div className="stack-sm">
              {bundle.certificates.map((certificate) => (
                <div className="check-item" key={certificate.id}>
                  <span className="check-mark" data-done={certificate.issued}>{certificate.issued ? "✓" : "!"}</span>
                  <span className="label">
                    {certificate.issued ? "Certificado emitido" : `Não emitido: ${certificate.not_issued_reason ?? "motivo não informado"}`}
                    <span className="hint" style={{ display: "block" }}>
                      {brDate(certificate.issued_on)}
                      {certificate.expires_on ? ` · válido até ${brDate(certificate.expires_on)}` : ""}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {canIssue && !issued && (
          <Card title="Registrar não emissão" subtitle="Quando o certificado não pode ser emitido.">
            <form action={registrarNaoEmissao} className="stack">
              <input type="hidden" name="case_id" value={bundle.detail.id} />
              <Field label="Motivo" required>
                <select name="not_issued_reason" required defaultValue={lastNotIssued?.not_issued_reason ?? ""}>
                  <option value="">Selecione</option>
                  {NOT_ISSUED.map((reason) => (
                    <option key={reason.value} value={reason.value}>{reason.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Comentários">
                <textarea name="comments" rows={2} />
              </Field>
              <button className="btn btn-danger" type="submit">Registrar não emissão</button>
            </form>
          </Card>
        )}

        {bundle.referrals.length > 0 && (
          <Card title="Encaminhamentos">
            <div className="stack-sm">
              {bundle.referrals.map((referral) => (
                <div key={referral.id}>
                  <div className="row" style={{ gap: 6 }}>
                    <Badge tone="danger">{brDate(referral.referred_on)}</Badge>
                    {referral.uk_notified && <Badge tone="info">UKHSA</Badge>}
                    {referral.local_notified && <Badge tone="neutral">local</Badge>}
                  </div>
                  <p className="small muted" style={{ marginTop: 3 }}>
                    {referral.reason.length ? referral.reason.join(" · ") : "Motivo não informado"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="Validade do certificado">
          <Dl
            items={[
              { label: "Regra base", value: "6 meses da CXR" },
              { label: "Contato familiar negativo", value: "3 meses (UKTBTI v7)" },
              { label: "Após escarro", value: "contar da CXR, não do laudo" },
              { label: "CXR", value: brDate(cxrOn) },
              { label: "Sugestão de validade", value: brDate(suggestedExpiry) },
            ]}
          />
          <p className="small muted" style={{ marginTop: 10 }}>
            A versão 2025 das instruções pode unificar a validade em 6 meses para familiares. Confirme a
            versão vigente com o UKHSA antes de alterar a regra.
          </p>
        </Card>
      </div>
    </div>
  );
}
