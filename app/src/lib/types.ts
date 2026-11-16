export type Role = "admin" | "medico" | "radiologista" | "secretaria" | "enfermeiro" | "auditor";

export type CaseStatus =
  | "rascunho" | "em_triagem" | "aguardando_cxr" | "aguardando_laudo"
  | "aguardando_escarro" | "aguardando_resultado" | "apto_certificado"
  | "certificado_emitido" | "encaminhado" | "em_tratamento" | "encerrado" | "cancelado";

export type Category = "adulto" | "gestante" | "crianca";
export type CxrResult = "normal" | "achado_nao_tb" | "tb_ativa_ou_antiga";
export type SputumStatus = "em_andamento" | "negativo" | "positivo" | null;

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  professional_registry: string | null;
  active: boolean;
}

export interface CaseOverview {
  id: string;
  case_number: string;
  status: CaseStatus;
  category: Category;
  opened_on: string;
  assessment_date: string | null;
  retention_until: string | null;
  uk_retention_until: string | null;
  assigned_physician: string | null;
  family_group_id: string | null;
  applicant_id: string;
  full_name: string;
  date_of_birth: string;
  passport_number: string;
  passport_country: string | null;
  identity_checks_done: number;
  consent_signed: boolean;
  screening_done: boolean;
  current_cxr_id: string | null;
  cxr_on: string | null;
  cxr_done: boolean;
  report_done: boolean;
  pp_reviewed: boolean;
  cxr_result: CxrResult | null;
  sputum_required: boolean;
  sputum_status: SputumStatus;
  sputum_started_on: string | null;
  sputum_deadline: string | null;
  certificate_issued: boolean;
  documents_count: number;
}

export interface Applicant {
  id: string;
  full_name: string;
  date_of_birth: string;
  sex: string | null;
  nationality: string | null;
  passport_number: string;
  passport_country: string | null;
  passport_issued_on: string | null;
  passport_expires_on: string | null;
  phone: string | null;
  email: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
}

export interface CaseRecord {
  id: string;
  case_number: string;
  applicant_id: string;
  clinic_id: string;
  family_group_id: string | null;
  category: Category;
  status: CaseStatus;
  opened_on: string;
  assessment_date: string | null;
  assigned_physician: string | null;
  notes: string | null;
  retention_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdentityCheck {
  id: string;
  stage: "registro" | "exame_medico" | "cxr" | "escarro" | "certificado";
  is_checked: boolean;
  checked_at: string | null;
  document_type: string | null;
  document_number: string | null;
  notes: string | null;
}

export interface Consent {
  case_id: string;
  signed: boolean;
  signed_on: string | null;
  form_version: string | null;
  language: string | null;
  explained_by: string | null;
  interpreter_name: string | null;
  pregnant_option: string | null;
  withdrawal_on: string | null;
  withdrawal_reason: string | null;
}

export interface Screening {
  case_id: string;
  screened_on: string | null;
  symptoms: string[];
  symptom_details: string | null;
  previous_tb: boolean;
  previous_tb_details: string | null;
  contact_tb: boolean;
  contact_details: string | null;
  household_tb: boolean;
  physical_exam: string | null;
  pregnant: boolean;
  lmp: string | null;
  clinical_decision: string | null;
  xray_required: boolean;
  xray_not_required_reason: string | null;
}

export interface ChestXray {
  id: string;
  case_id: string;
  performed_on: string;
  views: string[];
  facility: string | null;
  radiographer: string | null;
  image_quality: string | null;
  repeat_reason: string | null;
  dicom_path: string | null;
  viewer_path: string | null;
  sha256: string | null;
  is_current: boolean;
  created_at: string;
}

export interface RadiologyReport {
  case_id: string;
  reported_on: string | null;
  radiologist_name: string | null;
  radiologist_registry: string | null;
  findings_codes: string[];
  result: CxrResult | null;
  description: string | null;
  compared_previous: boolean;
  previous_reference: string | null;
  pp_reviewed: boolean;
  pp_reviewed_on: string | null;
  pp_review_notes: string | null;
}

export interface SputumSample {
  date?: string;
  time?: string;
  volume_ml?: string;
  quality?: string;
  method?: string;
}

export interface SputumExam {
  case_id: string;
  required: boolean;
  reason: string | null;
  planned_start_on: string | null;
  started_on: string | null;
  samples: SputumSample[];
  lab_name: string | null;
  lab_accreditation: string | null;
  sent_at: string | null;
  received_at: string | null;
  processed_at: string | null;
  microscopy_result: "em_andamento" | "negativo" | "positivo" | "inconclusivo" | null;
  culture_result: "em_andamento" | "negativo" | "positivo" | "inconclusivo" | null;
  dst_result: string | null;
  final_report_on: string | null;
  positive_notified_on: string | null;
  notes: string | null;
}

export interface Certificate {
  id: string;
  case_id: string;
  issued: boolean;
  number: string | null;
  issued_on: string | null;
  expires_on: string | null;
  after_sputum: boolean;
  not_issued_reason: string | null;
  comments: string | null;
  pets_reference: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  case_id: string;
  referred_on: string | null;
  letter_path: string | null;
  reason: string[];
  advised_treatment: boolean;
  local_notified: boolean;
  local_notified_on: string | null;
  uk_notified: boolean;
  uk_notified_on: string | null;
}

export interface Treatment {
  case_id: string;
  provider: string | null;
  regimen: string | null;
  started_on: string | null;
  ended_on: string | null;
  adherence: string | null;
  outcome: string | null;
  report_path: string | null;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  doc_type: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_at: string;
}

export interface CaseEvent {
  id: number;
  case_id: string;
  event_type: string;
  description: string;
  created_at: string;
}

export interface CaseBundle {
  detail: CaseRecord;
  applicant: Applicant;
  overview: CaseOverview | null;
  identity: IdentityCheck[];
  consent: Consent | null;
  screening: Screening | null;
  cxr: ChestXray | null;
  report: RadiologyReport | null;
  sputum: SputumExam | null;
  certificates: Certificate[];
  referrals: Referral[];
  treatment: Treatment | null;
  documents: CaseDocument[];
  events: CaseEvent[];
}
