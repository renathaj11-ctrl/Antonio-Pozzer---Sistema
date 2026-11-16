-- =============================================================================
-- UK TB Screening — esquema base
-- Postgres / Supabase. Execute no SQL Editor, na ordem 0001 -> 0004.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums
do $$ begin
  create type public.user_role as enum ('admin','medico','radiologista','secretaria','enfermeiro','auditor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.case_status as enum (
    'rascunho','em_triagem','aguardando_cxr','aguardando_laudo','aguardando_escarro',
    'aguardando_resultado','apto_certificado','certificado_emitido','encaminhado',
    'em_tratamento','encerrado','cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.applicant_category as enum ('adulto','gestante','crianca');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cxr_result as enum ('normal','achado_nao_tb','tb_ativa_ou_antiga');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sputum_result as enum ('em_andamento','negativo','positivo','inconclusivo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cert_not_issued_reason as enum ('tb_confirmada_ou_suspeita','teste_adiado','desistencia','processo_incompleto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.identity_stage as enum ('registro','exame_medico','cxr','escarro','certificado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.doc_type as enum ('passaporte','consentimento','cxr_dicom','cxr_imagem','laudo','escarro','encaminhamento','tratamento','certificado','outro');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- núcleo
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country text not null default 'Brasil',
  uk_provider_code text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null,
  role public.user_role not null default 'secretaria',
  professional_registry text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  date_of_birth date not null,
  sex text check (sex in ('feminino','masculino','outro')),
  nationality text,
  passport_number text not null,
  passport_country text,
  passport_issued_on date,
  passport_expires_on date,
  phone text,
  email text,
  address_line text,
  city text,
  state text,
  postcode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);
create index if not exists idx_applicants_passport on public.applicants (upper(passport_number));
create index if not exists idx_applicants_name on public.applicants (lower(full_name));

create table if not exists public.family_groups (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.case_counters (
  year integer primary key,
  last_value integer not null default 0
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique,
  applicant_id uuid not null references public.applicants(id) on delete restrict,
  clinic_id uuid not null references public.clinics(id),
  family_group_id uuid references public.family_groups(id),
  category public.applicant_category not null default 'adulto',
  status public.case_status not null default 'rascunho',
  opened_on date not null default current_date,
  assessment_date date,
  assigned_physician uuid references public.profiles(id),
  notes text,
  retention_until timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);
create index if not exists idx_cases_status on public.cases (status);
create index if not exists idx_cases_opened on public.cases (opened_on desc);
create index if not exists idx_cases_applicant on public.cases (applicant_id);

-- ---------------------------------------------------------------- seções do caso
create table if not exists public.identity_checks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  stage public.identity_stage not null,
  is_checked boolean not null default false,
  checked_at timestamptz,
  checked_by uuid references public.profiles(id),
  document_type text,
  document_number text,
  notes text,
  unique (case_id, stage)
);

create table if not exists public.consents (
  case_id uuid primary key references public.cases(id) on delete cascade,
  signed boolean not null default false,
  signed_on date,
  form_version text,
  language text default 'Português',
  explained_by text,
  interpreter_name text,
  pregnant_option text check (pregnant_option in ('adiar','escarro','cxr_dupla_protecao','na')),
  withdrawal_on date,
  withdrawal_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medical_screenings (
  case_id uuid primary key references public.cases(id) on delete cascade,
  screened_on date,
  symptoms text[] not null default '{}',
  symptom_details text,
  previous_tb boolean not null default false,
  previous_tb_details text,
  contact_tb boolean not null default false,
  contact_details text,
  household_tb boolean not null default false,
  physical_exam text,
  pregnant boolean not null default false,
  lmp date,
  clinical_decision text,
  xray_required boolean not null default true,
  xray_not_required_reason text,
  created_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.chest_xrays (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  performed_on date not null,
  views text[] not null default '{PA}',
  facility text,
  radiographer text,
  image_quality text check (image_quality in ('adequada','subotima_repetida')),
  repeat_reason text,
  dicom_path text,
  viewer_path text,
  sha256 text,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);
create index if not exists idx_cxr_case on public.chest_xrays (case_id);

create table if not exists public.radiology_reports (
  case_id uuid primary key references public.cases(id) on delete cascade,
  reported_on date,
  radiologist_name text,
  radiologist_registry text,
  findings_codes text[] not null default '{}',
  result public.cxr_result,
  description text,
  compared_previous boolean not null default false,
  previous_reference text,
  pp_reviewed boolean not null default false,
  pp_reviewed_on date,
  pp_review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sputum_exams (
  case_id uuid primary key references public.cases(id) on delete cascade,
  required boolean not null default false,
  reason text,
  planned_start_on date,
  started_on date,
  samples jsonb not null default '[]'::jsonb,
  lab_name text,
  lab_accreditation text,
  sent_at timestamptz,
  received_at timestamptz,
  processed_at timestamptz,
  microscopy_result public.sputum_result,
  culture_result public.sputum_result,
  dst_result text,
  final_report_on date,
  positive_notified_on timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  referred_on date,
  letter_path text,
  reason text[] not null default '{}',
  advised_treatment boolean not null default false,
  local_notified boolean not null default false,
  local_notified_on date,
  uk_notified boolean not null default false,
  uk_notified_on date,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create table if not exists public.treatments (
  case_id uuid primary key references public.cases(id) on delete cascade,
  provider text,
  regimen text,
  started_on date,
  ended_on date,
  adherence text,
  outcome text,
  report_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  issued boolean not null default false,
  number text,
  issued_on date,
  expires_on date,
  after_sputum boolean not null default false,
  not_issued_reason public.cert_not_issued_reason,
  comments text,
  pets_reference text,
  issued_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (expires_on is null or issued_on is null or expires_on > issued_on)
);
create index if not exists idx_certificates_case on public.certificates (case_id);

create table if not exists public.disclosures (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  disclosed_to text not null,
  purpose text,
  legal_basis text,
  channel text,
  disclosed_on date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  doc_type public.doc_type not null default 'outro',
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  sha256 text,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now()
);
create index if not exists idx_documents_case on public.case_documents (case_id);

create table if not exists public.case_events (
  id bigserial primary key,
  case_id uuid not null references public.cases(id) on delete cascade,
  event_type text not null,
  description text not null,
  actor uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_events_case on public.case_events (case_id, created_at desc);

create table if not exists public.audit_log (
  id bigserial primary key,
  table_name text not null,
  row_id uuid,
  action text not null,
  actor uuid,
  actor_email text,
  changed jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_row on public.audit_log (table_name, row_id);
create index if not exists idx_audit_created on public.audit_log (created_at desc);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
