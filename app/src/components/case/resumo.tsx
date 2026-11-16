import Link from "next/link";
import type { CaseBundle } from "@/lib/types";
import { salvarCaso, alterarStatus } from "@/lib/actions/casos";
import { Alert, Badge, Card, Dl, Field, Progress } from "@/components/ui";
import { age, brDate, brDateTime } from "@/lib/format";
import { CATEGORY_META, STATUS_META, certificateBlockers, checklist } from "@/lib/rules";

export function ResumoTab({
  bundle,
  canEdit,
  physicians,
}: {
  bundle: CaseBundle;
  canEdit: boolean;
  physicians: Array<{ id: string; full_name: string }>;
}) {
  const { applicant, detail, overview } = bundle;
  const blockers = overview ? certificateBlockers(overview) : [];
  const items = overview ? checklist(overview) : [];
  const required = items.filter((item) => item.required);
  const done = required.filter((item) => item.done).length;

  return (
    <div className="grid grid-side">
      <div className="stack">
        {!canEdit && (
          <Alert tone="info">
            Seu perfil tem acesso de leitura a esta seção. Alterações clínicas são feitas pelo médico,
            secretaria ou enfermagem.
          </Alert>
        )}

        <Card
          title="Dados do requerente"
          subtitle="Devem corresponder ao passaporte apresentado."
        >
          {canEdit ? (
            <form action={salvarCaso} className="stack">
              <input type="hidden" name="case_id" value={detail.id} />
              <div className="form-grid">
                <Field label="Nome completo" required className="span-2">
                  <input type="text" name="full_name" defaultValue={applicant.full_name} required />
                </Field>
                <Field label="Data de nascimento" required>
                  <input type="date" name="date_of_birth" defaultValue={applicant.date_of_birth} required />
                </Field>
                <Field label="Sexo">
                  <select name="sex" defaultValue={applicant.sex ?? ""}>
                    <option value="">Não informado</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="outro">Outro</option>
                  </select>
                </Field>
                <Field label="Nacionalidade">
                  <input type="text" name="nationality" defaultValue={applicant.nationality ?? ""} />
                </Field>
                <Field label="Categoria" hint="Gestante e criança têm regras próprias de CXR e prazos.">
                  <select name="category" defaultValue={detail.category}>
                    <option value="adulto">Adulto</option>
                    <option value="gestante">Gestante</option>
                    <option value="crianca">Criança (&lt; 11 anos)</option>
                  </select>
                </Field>

                <Field label="Passaporte" required>
                  <input type="text" name="passport_number" defaultValue={applicant.passport_number} required className="mono" />
                </Field>
                <Field label="País emissor">
                  <input type="text" name="passport_country" defaultValue={applicant.passport_country ?? ""} />
                </Field>
                <Field label="Emissão">
                  <input type="date" name="passport_issued_on" defaultValue={applicant.passport_issued_on ?? ""} />
                </Field>
                <Field label="Validade">
                  <input type="date" name="passport_expires_on" defaultValue={applicant.passport_expires_on ?? ""} />
                </Field>

                <Field label="Telefone">
                  <input type="tel" name="phone" defaultValue={applicant.phone ?? ""} />
                </Field>
                <Field label="E-mail">
                  <input type="email" name="email" defaultValue={applicant.email ?? ""} />
                </Field>
                <Field label="Endereço" className="span-2">
                  <input type="text" name="address_line" defaultValue={applicant.address_line ?? ""} />
                </Field>
                <Field label="Cidade">
                  <input type="text" name="city" defaultValue={applicant.city ?? ""} />
                </Field>
                <Field label="UF">
                  <input type="text" name="state" maxLength={2} defaultValue={applicant.state ?? ""} />
                </Field>
                <Field label="CEP">
                  <input type="text" name="postcode" defaultValue={applicant.postcode ?? ""} />
                </Field>

                <Field label="Data da avaliação médica">
                  <input type="date" name="assessment_date" defaultValue={detail.assessment_date ?? ""} />
                </Field>
                <Field label="Médico responsável">
                  <select name="assigned_physician" defaultValue={detail.assigned_physician ?? ""}>
                    <option value="">Não definido</option>
                    {physicians.map((physician) => (
                      <option key={physician.id} value={physician.id}>{physician.full_name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Observações administrativas" className="span-2">
                  <textarea name="notes" rows={3} defaultValue={detail.notes ?? ""} />
                </Field>
              </div>
              <div className="row-end">
                <button className="btn btn-primary" type="submit">Salvar dados</button>
              </div>
            </form>
          ) : (
            <Dl
              items={[
                { label: "Nome", value: applicant.full_name },
                { label: "Nascimento", value: `${brDate(applicant.date_of_birth)} (${age(applicant.date_of_birth)})` },
                { label: "Sexo", value: applicant.sex ?? "—" },
                { label: "Nacionalidade", value: applicant.nationality ?? "—" },
                { label: "Categoria", value: CATEGORY_META[detail.category] },
                { label: "Passaporte", value: <span className="mono">{applicant.passport_number}</span> },
                { label: "País emissor", value: applicant.passport_country ?? "—" },
                { label: "Telefone", value: applicant.phone ?? "—" },
                { label: "E-mail", value: applicant.email ?? "—" },
                { label: "Endereço", value: applicant.address_line ?? "—" },
                { label: "Cidade / UF", value: [applicant.city, applicant.state].filter(Boolean).join(" / ") || "—" },
                { label: "Avaliação médica", value: brDate(detail.assessment_date) },
                { label: "Médico", value: physicians.find((p) => p.id === detail.assigned_physician)?.full_name ?? "—" },
                { label: "Observações", value: detail.notes ?? "—" },
              ]}
            />
          )}
        </Card>

        {canEdit && (
          <Card title="Situação do caso" subtitle="A alteração manual fica registrada no histórico.">
            <form action={alterarStatus} className="row" style={{ alignItems: "flex-end" }}>
              <input type="hidden" name="case_id" value={detail.id} />
              <label className="field" style={{ flex: "1 1 240px" }}>
                <span>Status atual</span>
                <select name="status" defaultValue={detail.status}>
                  {Object.entries(STATUS_META).map(([value, meta]) => (
                    <option key={value} value={value}>{meta.label}</option>
                  ))}
                </select>
              </label>
              <button className="btn" type="submit">Atualizar status</button>
            </form>
          </Card>
        )}
      </div>

      <div className="stack">
        <Card title="Progresso" subtitle={overview ? STATUS_META[overview.status].label : undefined}>
          <div className="stack">
            <Progress value={done} total={required.length} />
            <div className="checklist">
              {items.map((item) => (
                <div className="check-item" key={item.key}>
                  <span className="check-mark" data-done={item.done}>{item.done ? "✓" : "·"}</span>
                  <span className="label">
                    {item.label}
                    <span className="hint" style={{ display: "block" }}>{item.hint}</span>
                  </span>
                  {!item.done && (
                    <Link className="btn btn-sm" href={`/casos/${detail.id}?tab=${item.tab}`}>Abrir</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {blockers.length > 0 && (
          <Card title="Antes de emitir o certificado">
            <div className="stack-sm">
              {blockers.map((blocker) => (
                <div className="check-item" key={blocker.key}>
                  <span className="check-mark" data-done={false}>!</span>
                  <span className="label">
                    {blocker.message}
                    <Link className="hint" style={{ display: "block" }} href={`/casos/${detail.id}?tab=${blocker.tab}`}>
                      Ir para a seção
                    </Link>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="Retenção e privacidade">
          <Dl
            items={[
              { label: "Caso", value: <span className="mono">{detail.case_number}</span> },
              { label: "Aberto em", value: brDate(detail.opened_on) },
              { label: "Última atualização", value: brDateTime(detail.updated_at) },
              {
                label: "Retenção local",
                value: overview?.retention_until ? brDate(overview.retention_until) : "—",
              },
              {
                label: "Mínimo UK",
                value: overview?.uk_retention_until ? brDate(overview.uk_retention_until) : "—",
              },
              { label: "Documentos", value: `${overview?.documents_count ?? 0} arquivo(s)` },
            ]}
          />
          <p className="small muted" style={{ marginTop: 10 }}>
            Prazo local de 20 anos (CFM 1.821/2007) contado do último registro. O mínimo britânico de
            3 anos é mantido como referência informativa.
          </p>
        </Card>

        {overview?.certificate_issued && (
          <Alert tone="ok">
            <strong>Certificado emitido.</strong>{" "}
            {bundle.certificates.find((certificate) => certificate.issued)?.expires_on
              ? `Válido até ${brDate(bundle.certificates.find((certificate) => certificate.issued)?.expires_on ?? null)}.`
              : ""}
            {" "}
            <Link href={`/casos/${detail.id}?tab=desfecho`} className="small">Ver desfecho</Link>
          </Alert>
        )}

        {overview?.sputum_status === "positivo" && (
          <Alert tone="danger">
            <strong>Escarro positivo.</strong> O caso deve ser encaminhado para tratamento, não certificado.
          </Alert>
        )}

        <Card title="Identificadores">
          <div className="pill-row">
            <Badge tone="neutral">{CATEGORY_META[detail.category]}</Badge>
            <Badge tone="neutral">{age(applicant.date_of_birth)}</Badge>
            <Badge tone="neutral">{(overview?.sputum_required ? "escarro indicado" : "escarro não indicado")}</Badge>
            {overview?.pp_reviewed && <Badge tone="ok">revisado pelo PP</Badge>}
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>
            ID interno: <span className="mono">{detail.id.slice(0, 8)}</span>
          </p>
        </Card>
      </div>
    </div>
  );
}
