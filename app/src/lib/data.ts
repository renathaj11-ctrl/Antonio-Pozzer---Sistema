import { createServerSupabase } from "./supabase/server";
import type {
  Applicant, CaseBundle, CaseDocument, CaseEvent, CaseOverview, CaseRecord,
  Certificate, ChestXray, Consent, IdentityCheck, Profile, RadiologyReport,
  Referral, Screening, SputumExam, Treatment,
} from "./types";

export interface ListFilters {
  q?: string;
  status?: string;
  ano?: string;
  limit?: number;
}

export async function listCases(filters: ListFilters = {}): Promise<CaseOverview[]> {
  const supabase = await createServerSupabase();
  let query = supabase.from("v_case_overview").select("*").order("opened_on", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.ano) {
    query = query.gte("opened_on", `${filters.ano}-01-01`).lte("opened_on", `${filters.ano}-12-31`);
  }
  if (filters.q) {
    const term = filters.q.replace(/[,()%]/g, " ").trim();
    if (term) {
      query = query.or(`full_name.ilike.%${term}%,case_number.ilike.%${term}%,passport_number.ilike.%${term}%`);
    }
  }
  query = query.limit(filters.limit ?? 200);

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar casos: ${error.message}`);
  return (data ?? []) as unknown as CaseOverview[];
}

export async function getCaseBundle(id: string): Promise<CaseBundle | null> {
  const supabase = await createServerSupabase();

  // Todas as consultas dependem apenas do id: uma única ida ao banco.
  const [
    rowResult,
    overview, identity, consent, screening, cxr, report, sputum,
    certificates, referrals, treatment, documents, events,
  ] = await Promise.all([
    supabase.from("cases").select("*, applicant:applicants(*)").eq("id", id).maybeSingle(),
    supabase.from("v_case_overview").select("*").eq("id", id).maybeSingle(),
    supabase.from("identity_checks").select("*").eq("case_id", id).order("stage"),
    supabase.from("consents").select("*").eq("case_id", id).maybeSingle(),
    supabase.from("medical_screenings").select("*").eq("case_id", id).maybeSingle(),
    supabase.from("chest_xrays").select("*").eq("case_id", id).eq("is_current", true).maybeSingle(),
    supabase.from("radiology_reports").select("*").eq("case_id", id).maybeSingle(),
    supabase.from("sputum_exams").select("*").eq("case_id", id).maybeSingle(),
    supabase.from("certificates").select("*").eq("case_id", id).order("created_at", { ascending: false }),
    supabase.from("referrals").select("*").eq("case_id", id).order("created_at", { ascending: false }),
    supabase.from("treatments").select("*").eq("case_id", id).maybeSingle(),
    supabase.from("case_documents").select("*").eq("case_id", id).order("uploaded_at", { ascending: false }),
    supabase.from("case_events").select("*").eq("case_id", id).order("created_at", { ascending: false }).limit(60),
  ]);

  if (rowResult.error) throw new Error(`Falha ao carregar caso: ${rowResult.error.message}`);
  if (!rowResult.data) return null;

  const record = rowResult.data as unknown as CaseRecord & { applicant: Applicant };

  return {
    detail: record,
    applicant: record.applicant,
    overview: (overview.data as unknown as CaseOverview | null) ?? null,
    identity: (identity.data ?? []) as unknown as IdentityCheck[],
    consent: (consent.data as unknown as Consent | null) ?? null,
    screening: (screening.data as unknown as Screening | null) ?? null,
    cxr: (cxr.data as unknown as ChestXray | null) ?? null,
    report: (report.data as unknown as RadiologyReport | null) ?? null,
    sputum: (sputum.data as unknown as SputumExam | null) ?? null,
    certificates: (certificates.data ?? []) as unknown as Certificate[],
    referrals: (referrals.data ?? []) as unknown as Referral[],
    treatment: (treatment.data as unknown as Treatment | null) ?? null,
    documents: (documents.data ?? []) as unknown as CaseDocument[],
    events: (events.data ?? []) as unknown as CaseEvent[],
  };
}

export interface DashboardData {
  rows: CaseOverview[];
  totals: {
    active: number;
    awaitingReport: number;
    sputumDue: number;
    missingDocs: number;
    certificatesMonth: number;
    referrals: number;
  };
  attention: CaseOverview[];
}

export async function getDashboard(): Promise<DashboardData> {
  const rows = await listCases({ limit: 1000 });
  const supabase = await createServerSupabase();

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const monthStart = firstOfMonth.toISOString().slice(0, 10);

  const { count: certificatesMonth } = await supabase
    .from("certificates")
    .select("id", { count: "exact", head: true })
    .eq("issued", true)
    .gte("issued_on", monthStart);

  const { count: referrals } = await supabase
    .from("referrals")
    .select("id", { count: "exact", head: true });

  const activeStatuses = ["em_triagem", "aguardando_cxr", "aguardando_laudo", "aguardando_escarro", "aguardando_resultado", "apto_certificado"];
  const active = rows.filter((r) => activeStatuses.includes(r.status));

  const awaitingReport = rows.filter((r) => r.cxr_done && !r.report_done).length;
  const sputumDue = rows.filter((r) => {
    if (!r.sputum_deadline) return false;
    const days = Math.ceil((new Date(`${r.sputum_deadline}T12:00:00`).getTime() - Date.now()) / 86_400_000);
    return days <= 7 && r.sputum_status !== "negativo" && r.sputum_status !== "positivo" && r.status !== "certificado_emitido";
  }).length;

  const { missingCount } = await import("./rules");
  const missingDocs = rows.filter((r) => activeStatuses.includes(r.status) && missingCount(r) > 0).length;

  const attention = [...rows]
    .filter((r) => {
      const lateSputum = r.sputum_deadline
        ? new Date(`${r.sputum_deadline}T12:00:00`).getTime() < Date.now() && r.sputum_status !== "negativo" && r.sputum_status !== "positivo"
        : false;
      return lateSputum || (r.cxr_done && !r.report_done) || (r.cxr_result === "tb_ativa_ou_antiga" && r.sputum_status === "positivo");
    })
    .slice(0, 8);

  return {
    rows,
    totals: {
      active: active.length,
      awaitingReport,
      sputumDue,
      missingDocs,
      certificatesMonth: certificatesMonth ?? 0,
      referrals: referrals ?? 0,
    },
    attention,
  };
}

export async function getTeam(): Promise<Profile[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  return (data ?? []) as unknown as Profile[];
}

export interface AuditRow {
  id: number;
  table_name: string;
  row_id: string | null;
  action: string;
  actor_email: string | null;
  created_at: string;
  changed: Record<string, unknown> | null;
}

export async function getAuditLog(limit = 100): Promise<AuditRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("audit_log")
    .select("id, table_name, row_id, action, actor_email, created_at, changed")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as AuditRow[];
}
