import type { CaseOverview, CaseStatus, Category, CxrResult } from "./types";
import { brDate } from "./format";

export const STATUS_META: Record<CaseStatus, { label: string; tone: string }> = {
  rascunho: { label: "Rascunho", tone: "neutral" },
  em_triagem: { label: "Em triagem", tone: "info" },
  aguardando_cxr: { label: "Aguardando CXR", tone: "info" },
  aguardando_laudo: { label: "Aguardando laudo", tone: "warn" },
  aguardando_escarro: { label: "Aguardando escarro", tone: "warn" },
  aguardando_resultado: { label: "Aguardando resultado", tone: "warn" },
  apto_certificado: { label: "Apto a certificado", tone: "ok" },
  certificado_emitido: { label: "Certificado emitido", tone: "done" },
  encaminhado: { label: "Encaminhado", tone: "danger" },
  em_tratamento: { label: "Em tratamento", tone: "danger" },
  encerrado: { label: "Encerrado", tone: "neutral" },
  cancelado: { label: "Cancelado", tone: "neutral" },
};

export const CATEGORY_META: Record<Category, string> = {
  adulto: "Adulto",
  gestante: "Gestante",
  crianca: "Criança (< 11 anos)",
};

export const CXR_RESULT_META: Record<CxrResult, string> = {
  normal: "CXR normal",
  achado_nao_tb: "Achado não-TB",
  tb_ativa_ou_antiga: "Compatível com TB ativa ou antiga",
};

export const ID_STAGES = [
  { key: "registro", label: "Registro / recepção" },
  { key: "exame_medico", label: "Exame médico" },
  { key: "cxr", label: "Radiografia" },
  { key: "escarro", label: "Coleta de escarro" },
  { key: "certificado", label: "Certificado ou encaminhamento" },
] as const;

export const SYMPTOMS = [
  "Tosse",
  "Hemoptise",
  "Perda de peso",
  "Sudorese noturna",
  "Febre",
  "Outro sintoma",
];

export const FINDINGS = [
  { group: "Achados menores", codes: [
    ["1.1", "Faixa/banda/cicatriz fibrosa única"],
    ["1.2", "Ilhotas ósseas"],
    ["2.1", "Capping pleural de borda inferior lisa (< 1 cm)"],
    ["2.2", "Embotamento de ângulo costofrênico abaixo da horizontal"],
    ["2.3", "Nódulo(s) calcificado(s) hilar/mediastinal sem granulomas"],
  ] },
  { group: "Menores, ocasionalmente associados à TB", codes: [
    ["3.1", "Granuloma solitário < 1 cm, hilo normal"],
    ["3.2", "Granuloma solitário < 1 cm com linfonodo calcificado"],
    ["3.3", "Nódulos pulmonares calcificados, bordas definidas"],
    ["3.4", "Lesões pleurais calcificadas"],
    ["3.5", "Embotamento de ângulo costofrênico acima da horizontal"],
  ] },
  { group: "Achados por vezes vistos em TB ativa", codes: [
    ["4.0", "Capping apical notável (rugoso ou ≥ 1 cm)"],
    ["4.1", "Lesões apicais fibronodulares/fibrocalcificas"],
    ["4.2", "Nódulos/micronódulos não calcificados"],
    ["4.3", "Massa/linfadenopatia hilar ou mediastinal isolada"],
    ["4.4", "Nódulo(s)/massa(s) ≥ 1 cm"],
    ["4.5", "Fibrose pleural não calcificada e/ou derrame"],
    ["4.6", "Fibrose intersticial / doença pulmonar aguda"],
    ["4.7", "Lesão cavitária ou lesão 'fluffy' sugestiva de TB ativa"],
  ] },
] as const;

export function needsSputum(o: Pick<CaseOverview, "sputum_required" | "cxr_result" | "sputum_status">): boolean {
  if (o.cxr_result === "tb_ativa_ou_antiga") return true;
  return o.sputum_required;
}

export function certificateExpiry(cxrOn: string, familyPositive = false): string {
  // Regra versionada: v7 = 6 meses; contato familiar negativo = 3 meses.
  // A atualização de 2025 prevê 6 meses para familiares. Ver CERT-07 e L-03.
  const months = familyPositive ? 3 : 6;
  const d = new Date(`${cxrOn}T12:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function sputumDeadline(cxrOn: string | null): string | null {
  if (!cxrOn) return null;
  const d = new Date(`${cxrOn}T12:00:00`);
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export interface Blocker {
  key: string;
  message: string;
  tab: string;
}

export function certificateBlockers(o: CaseOverview): Blocker[] {
  const b: Blocker[] = [];
  if (!o.consent_signed) b.push({ key: "consent", message: "Consentimento informado não assinado.", tab: "consentimento" });
  if (o.identity_checks_done === 0) b.push({ key: "identity", message: "Nenhuma verificação de identidade registrada.", tab: "identidade" });
  if (!o.screening_done) b.push({ key: "screening", message: "Triagem clínica não registrada.", tab: "triagem" });
  if (!o.cxr_done) b.push({ key: "cxr", message: "Radiografia de tórax não registrada.", tab: "cxr" });
  if (!o.report_done) b.push({ key: "report", message: "Laudo radiológico não registrado.", tab: "laudo" });
  if (o.report_done && !o.pp_reviewed) b.push({ key: "review", message: "Laudo ainda não revisado pelo Panel Physician.", tab: "laudo" });
  if (o.report_done && !o.cxr_result) b.push({ key: "result", message: "Laudo sem resultado classificado.", tab: "laudo" });
  if (needsSputum(o) && o.sputum_status === "positivo") b.push({ key: "sputum_pos", message: "Escarro positivo: caso deve ser encaminhado, não certificado.", tab: "escarro" });
  if (needsSputum(o) && o.sputum_status !== "negativo" && o.sputum_status !== "positivo") {
    b.push({ key: "sputum_pending", message: "Escarro indicado, mas sem laudo final negativo.", tab: "escarro" });
  }
  return b;
}

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  hint: string;
  tab: string;
  required: boolean;
}

export function checklist(o: CaseOverview): ChecklistItem[] {
  const sputumOk = !needsSputum(o) || o.sputum_status === "negativo" || o.sputum_status === "positivo";
  return [
    { key: "identity", label: "Identidade verificada", done: o.identity_checks_done >= 1, hint: `${o.identity_checks_done}/5 estágios`, tab: "identidade", required: true },
    { key: "consent", label: "Consentimento assinado", done: o.consent_signed, hint: o.consent_signed ? "assinado" : "pendente", tab: "consentimento", required: true },
    { key: "screening", label: "Triagem clínica", done: o.screening_done, hint: o.screening_done ? "registrada" : "pendente", tab: "triagem", required: true },
    { key: "cxr", label: "CXR realizada", done: o.cxr_done, hint: o.cxr_on ? `em ${brDate(o.cxr_on)}` : "pendente", tab: "cxr", required: true },
    { key: "report", label: "Laudo radiológico", done: o.report_done, hint: o.report_done ? "registrado" : "pendente", tab: "laudo", required: true },
    { key: "review", label: "Revisão do Panel Physician", done: o.pp_reviewed, hint: o.pp_reviewed ? "revisado" : "pendente", tab: "laudo", required: true },
    { key: "sputum", label: "Escarro", done: sputumOk, hint: needsSputum(o) ? (o.sputum_status ?? "pendente") : "não indicado", tab: "escarro", required: needsSputum(o) },
    { key: "outcome", label: "Desfecho registrado", done: o.certificate_issued || o.status === "encaminhado" || o.status === "em_tratamento" || o.status === "encerrado", hint: o.certificate_issued ? "certificado emitido" : "pendente", tab: "desfecho", required: true },
  ];
}

export function missingCount(o: CaseOverview): number {
  return checklist(o).filter((i) => i.required && !i.done).length;
}

export function nextAction(o: CaseOverview): { label: string; tab: string } {
  if (!o.consent_signed) return { label: "Colher consentimento", tab: "consentimento" };
  if (o.identity_checks_done === 0) return { label: "Verificar identidade", tab: "identidade" };
  if (!o.screening_done) return { label: "Fazer triagem clínica", tab: "triagem" };
  if (!o.cxr_done) return { label: "Registrar CXR", tab: "cxr" };
  if (!o.report_done) return { label: "Aguardar laudo", tab: "laudo" };
  if (!o.pp_reviewed) return { label: "Revisar laudo", tab: "laudo" };
  if (needsSputum(o) && o.sputum_status !== "negativo" && o.sputum_status !== "positivo") {
    return { label: "Coletar escarro", tab: "escarro" };
  }
  if (o.sputum_status === "positivo") return { label: "Encaminhar para tratamento", tab: "desfecho" };
  if (!o.certificate_issued) return { label: "Emitir certificado", tab: "desfecho" };
  return { label: "Concluir caso", tab: "resumo" };
}

export function deadlineTone(deadline: string | null): "ok" | "warn" | "danger" | "neutral" {
  if (!deadline) return "neutral";
  const days = Math.ceil((new Date(`${deadline}T12:00:00`).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "danger";
  if (days <= 2) return "warn";
  return "ok";
}
