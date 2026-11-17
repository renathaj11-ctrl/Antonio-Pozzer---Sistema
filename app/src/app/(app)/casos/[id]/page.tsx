import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile, canWrite } from "@/lib/auth";
import { getCaseBundle } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase/server";
import { age, brDate, maskPassport } from "@/lib/format";
import { STATUS_META, checklist, nextAction } from "@/lib/rules";
import { Alert, Badge, Progress } from "@/components/ui";
import type { Tone } from "@/components/ui";
import { ResumoTab } from "@/components/case/resumo";
import { IdentidadeTab } from "@/components/case/identidade";
import { ConsentimentoTab } from "@/components/case/consentimento";
import { TriagemTab } from "@/components/case/triagem";
import { CxrTab } from "@/components/case/cxr";
import { LaudoTab } from "@/components/case/laudo";
import { EscarroTab } from "@/components/case/escarro";
import { DesfechoTab } from "@/components/case/desfecho";
import { DocumentosTab } from "@/components/case/documentos";
import { HistoricoTab } from "@/components/case/historico";
import { TabNav } from "@/components/case/tab-nav";

const TABS = [
  { key: "resumo", label: "Resumo" },
  { key: "identidade", label: "Identidade" },
  { key: "consentimento", label: "Consentimento" },
  { key: "triagem", label: "Triagem" },
  { key: "cxr", label: "Radiografia" },
  { key: "laudo", label: "Laudo" },
  { key: "escarro", label: "Escarro" },
  { key: "desfecho", label: "Desfecho" },
  { key: "documentos", label: "Documentos" },
  { key: "historico", label: "Histórico" },
] as const;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

async function listarMedicos(): Promise<Array<{ id: string; full_name: string }>> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("active", true)
    .in("role", ["medico", "admin"])
    .order("full_name");
  return (data ?? []) as Array<{ id: string; full_name: string }>;
}

export default async function CasoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireProfile();
  const { id } = await params;
  const sp = await searchParams;

  const canClinical = canWrite(profile.role, "clinical");

  // Busca o caso e a lista de médicos ao mesmo tempo (uma única espera).
  const [bundle, medicos] = await Promise.all([
    getCaseBundle(id),
    canClinical ? listarMedicos() : Promise.resolve([]),
  ]);
  if (!bundle) notFound();

  const tab = first(sp.tab) || "resumo";
  const ok = first(sp.ok);
  const erro = first(sp.erro);

  const overview = bundle.overview;
  const statusMeta = overview ? STATUS_META[overview.status] : null;
  const items = overview ? checklist(overview) : [];
  const required = items.filter((item) => item.required);
  const doneRequired = required.filter((item) => item.done).length;
  const next = overview ? nextAction(overview) : null;

  const canRadiology = canWrite(profile.role, "radiology");
  const canCertificate = canWrite(profile.role, "certificate");
  const canUpload = canClinical || canRadiology;

  const physicians = medicos;

  const dots: Record<string, Tone | undefined> = overview
    ? {
        identidade: overview.identity_checks_done > 0 ? "ok" : undefined,
        consentimento: overview.consent_signed ? "ok" : undefined,
        triagem: overview.screening_done ? "ok" : undefined,
        cxr: overview.cxr_done ? "ok" : undefined,
        laudo: overview.report_done && overview.pp_reviewed ? "ok" : overview.report_done ? "warn" : undefined,
        escarro: overview.sputum_required
          ? overview.sputum_status === "negativo"
            ? "ok"
            : overview.sputum_status === "positivo"
              ? "danger"
              : "warn"
          : undefined,
        desfecho: overview.certificate_issued ? "ok" : overview.status === "encaminhado" ? "danger" : undefined,
      }
    : {};

  return (
    <>
      <header className="topbar">
        <div>
          <div className="row" style={{ gap: 8 }}>
            <Link className="small muted" href="/casos">← Casos</Link>
            <span className="mono small muted">{bundle.detail.case_number}</span>
          </div>
          <h1 style={{ marginTop: 2 }}>{bundle.applicant.full_name}</h1>
        </div>
        <div className="topbar-actions">
          {statusMeta && <Badge tone={statusMeta.tone as Tone} dot>{statusMeta.label}</Badge>}
          {next && (
            <Link className="btn btn-primary btn-sm" href={`/casos/${bundle.detail.id}?tab=${next.tab}`}>
              {next.label}
            </Link>
          )}
        </div>
      </header>

      <div className="content stack" style={{ gap: 16 }}>
        <div className="spread">
          <div className="row small muted" style={{ gap: 18 }}>
            <span>{age(bundle.applicant.date_of_birth)} · nasc. {brDate(bundle.applicant.date_of_birth)}</span>
            <span className="mono">Passaporte {maskPassport(bundle.applicant.passport_number)}</span>
            {bundle.applicant.passport_country && <span>{bundle.applicant.passport_country}</span>}
            <span>Aberto em {brDate(bundle.detail.opened_on)}</span>
          </div>
          {overview && (
            <div style={{ minWidth: 240, flex: "0 1 300px" }}>
              <Progress value={doneRequired} total={required.length} />
            </div>
          )}
        </div>

        {ok && <Alert tone="ok">{ok}</Alert>}
        {erro && <Alert tone="danger">{erro}</Alert>}

        <TabNav caseId={bundle.detail.id} items={TABS} active={tab} dots={dots} />

        {tab === "resumo" && (
          <ResumoTab bundle={bundle} canEdit={canClinical} physicians={physicians} />
        )}
        {tab === "identidade" && <IdentidadeTab bundle={bundle} canEdit={canClinical} />}
        {tab === "consentimento" && <ConsentimentoTab bundle={bundle} canEdit={canClinical} />}
        {tab === "triagem" && <TriagemTab bundle={bundle} canEdit={canClinical} />}
        {tab === "cxr" && <CxrTab bundle={bundle} canEdit={canRadiology} />}
        {tab === "laudo" && <LaudoTab bundle={bundle} canEdit={canRadiology} canReview={canCertificate} />}
        {tab === "escarro" && <EscarroTab bundle={bundle} canEdit={canClinical} />}
        {tab === "desfecho" && <DesfechoTab bundle={bundle} canIssue={canCertificate} canEdit={canClinical} />}
        {tab === "documentos" && <DocumentosTab bundle={bundle} canUpload={canUpload} />}
        {tab === "historico" && <HistoricoTab bundle={bundle} />}
        {!TABS.some((item) => item.key === tab) && <ResumoTab bundle={bundle} canEdit={canClinical} physicians={physicians} />}
      </div>
    </>
  );
}
