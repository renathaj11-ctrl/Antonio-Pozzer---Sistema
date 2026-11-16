import Link from "next/link";
import type { CaseBundle } from "@/lib/types";
import { salvarCxr } from "@/lib/actions/casos";
import { Alert, Card, Dl, Field } from "@/components/ui";
import { brDate, daysBetween } from "@/lib/format";

export function CxrTab({ bundle, canEdit }: { bundle: CaseBundle; canEdit: boolean }) {
  const cxr = bundle.cxr;
  const views = cxr?.views ?? ["PA"];
  const deadline = bundle.overview?.sputum_deadline ?? null;
  const days = daysBetween(deadline);

  return (
    <div className="grid grid-side">
      <Card
        title={cxr ? "Radiografia vigente" : "Registrar radiografia de tórax"}
        subtitle="A CXR é a base da validade do certificado (6 meses)."
      >
        {canEdit ? (
          <form action={salvarCxr} className="stack">
            <input type="hidden" name="case_id" value={bundle.detail.id} />
            {cxr && <input type="hidden" name="cxr_id" value={cxr.id} />}

            <div className="form-grid">
              <Field label="Data da realização" required>
                <input type="date" name="performed_on" defaultValue={cxr?.performed_on ?? ""} required />
              </Field>
              <Field label="Qualidade da imagem">
                <select name="image_quality" defaultValue={cxr?.image_quality ?? ""}>
                  <option value="">Não avaliada</option>
                  <option value="adequada">Adequada</option>
                  <option value="subotima_repetida">Subótima / repetida</option>
                </select>
              </Field>
              <Field label="Instalação">
                <input type="text" name="facility" defaultValue={cxr?.facility ?? ""} />
              </Field>
              <Field label="Radiografista / operador">
                <input type="text" name="radiographer" defaultValue={cxr?.radiographer ?? ""} />
              </Field>
              <Field label="Motivo da repetição" className="span-2">
                <input type="text" name="repeat_reason" defaultValue={cxr?.repeat_reason ?? ""} />
              </Field>
            </div>

            <div>
              <p className="field-label">Incidências realizadas</p>
              <div className="check-grid" style={{ marginTop: 6 }}>
                {["PA", "AP", "Lateral"].map((view) => (
                  <label className="check" key={view}>
                    <input type="checkbox" name="views" value={view} defaultChecked={views.includes(view)} />
                    <span>{view}</span>
                  </label>
                ))}
              </div>
            </div>

            <Alert tone="info">
              A imagem DICOM e o arquivo do laudo devem ser anexados na aba <strong>Documentos</strong>.
              O sistema registra o caminho e o hash do arquivo para rastreabilidade.
            </Alert>

            <div className="row-end">
              <button className="btn btn-primary" type="submit">Salvar radiografia</button>
            </div>
          </form>
        ) : cxr ? (
          <Dl
            items={[
              { label: "Realizada em", value: brDate(cxr.performed_on) },
              { label: "Incidências", value: cxr.views.join(", ") },
              { label: "Instalação", value: cxr.facility ?? "—" },
              { label: "Operador", value: cxr.radiographer ?? "—" },
              { label: "Qualidade", value: cxr.image_quality ?? "—" },
              { label: "Repetição", value: cxr.repeat_reason ?? "—" },
            ]}
          />
        ) : (
          <p className="muted small">Nenhuma radiografia registrada.</p>
        )}
      </Card>

      <div className="stack">
        {cxr && (
          <Card title="Dados da imagem">
            <Dl
              items={[
                { label: "Data", value: brDate(cxr.performed_on) },
                { label: "Registrada em", value: brDate(cxr.created_at) },
                { label: "DICOM", value: cxr.dicom_path ? <span className="mono small">{cxr.dicom_path}</span> : "Não anexado" },
                { label: "SHA-256", value: cxr.sha256 ? <span className="mono small">{cxr.sha256.slice(0, 16)}…</span> : "—" },
              ]}
            />
            <div className="row" style={{ marginTop: 12 }}>
              <Link className="btn btn-sm" href={`/casos/${bundle.detail.id}?tab=documentos`}>
                Anexar / ver arquivos
              </Link>
            </div>
          </Card>
        )}

        <Card title="Prazos decorrentes">
          <Dl
            items={[
              { label: "Escarro até", value: deadline ? `${brDate(deadline)}${days !== null ? ` (${days >= 0 ? `${days} dia(s)` : `${Math.abs(days)} dia(s) atrás`})` : ""}` : "—" },
              { label: "Laudo em até", value: "1 dia após a CXR" },
              { label: "Validade do certificado", value: cxr ? "6 meses a partir da CXR" : "depende da CXR" },
            ]}
          />
          {deadline && days !== null && days < 0 && bundle.overview?.sputum_required && bundle.overview.sputum_status !== "negativo" && (
            <Alert tone="danger">
              O prazo de 7 dias para iniciar o escarro venceu. Registre a justificativa e a conduta.
            </Alert>
          )}
        </Card>

        <Card title="Requisitos de imagem">
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Incidência PA em inspiração completa, incluindo ápices e ângulos costofrênicos.</li>
            <li>Imagem de qualidade diagnóstica; repetir se subótima.</li>
            <li>Identificação do paciente na imagem e no arquivo DICOM.</li>
            <li>Laudo radiológico em até 1 dia útil, revisado pelo Panel Physician.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
