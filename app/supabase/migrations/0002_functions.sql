-- =============================================================================
-- Funções, triggers e visão operacional
-- =============================================================================

-- ---------------------------------------------------------------- updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------- numeração UKTB
create or replace function public.next_case_number(p_year integer)
returns text language plpgsql security definer set search_path = public as $$
declare v_value integer;
begin
  insert into public.case_counters (year, last_value)
  values (p_year, 1)
  on conflict (year) do update set last_value = public.case_counters.last_value + 1
  returning last_value into v_value;

  return format('UKTB-%s-%s', p_year, lpad(v_value::text, 4, '0'));
end $$;

create or replace function public.assign_case_number()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.case_number is null then
    new.case_number := public.next_case_number(extract(year from coalesce(new.opened_on, current_date))::int);
  end if;
  if new.retention_until is null then
    -- Conservador: 20 anos (CFM 1.821/2007) contados do último registro.
    -- O mínimo britânico de 3 anos é calculado na visão v_case_overview.
    new.retention_until := greatest(
      coalesce(new.assessment_date, new.opened_on, current_date)::timestamptz,
      now()
    ) + interval '20 years';
  end if;
  return new;
end $$;

create trigger trg_cases_number
before insert on public.cases
for each row execute function public.assign_case_number();

-- ---------------------------------------------------------------- CXR corrente
create or replace function public.keep_single_current_cxr()
returns trigger language plpgsql as $$
begin
  if new.is_current then
    update public.chest_xrays
       set is_current = false
     where case_id = new.case_id and id <> new.id and is_current;
  end if;
  return new;
end $$;

create trigger trg_cxr_current
after insert or update of is_current on public.chest_xrays
for each row execute function public.keep_single_current_cxr();

-- ---------------------------------------------------------------- retenção
-- Cada novo registro clínico reinicia a contagem local de 20 anos.
create or replace function public.recalc_retention()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_case uuid;
begin
  v_case := case when tg_op = 'DELETE' then old.case_id else new.case_id end;
  update public.cases
     set retention_until = greatest(
           coalesce(assessment_date, opened_on, current_date)::timestamptz,
           now()
         ) + interval '20 years'
   where id = v_case;
  return case when tg_op = 'DELETE' then old else new end;
end $$;

-- ---------------------------------------------------------------- certificado
create or replace function public.enforce_certificate_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_consent boolean;
  v_identity integer;
  v_cxr uuid;
  v_result public.cxr_result;
  v_reviewed boolean;
  v_required boolean;
  v_micro public.sputum_result;
  v_culture public.sputum_result;
  v_final date;
begin
  if not new.issued then
    return new;
  end if;

  select coalesce(signed, false) into v_consent
    from public.consents where case_id = new.case_id;
  if not coalesce(v_consent, false) then
    raise exception 'Certificado bloqueado: consentimento informado não assinado.';
  end if;

  select count(*) into v_identity
    from public.identity_checks where case_id = new.case_id and is_checked;
  if v_identity = 0 then
    raise exception 'Certificado bloqueado: nenhuma verificação de identidade registrada.';
  end if;

  select id into v_cxr
    from public.chest_xrays where case_id = new.case_id and is_current limit 1;
  if v_cxr is null then
    raise exception 'Certificado bloqueado: não há radiografia de tórax vigente.';
  end if;

  select result, pp_reviewed into v_result, v_reviewed
    from public.radiology_reports where case_id = new.case_id;
  if not coalesce(v_reviewed, false) then
    raise exception 'Certificado bloqueado: laudo radiológico ainda não revisado pelo Panel Physician.';
  end if;
  if v_result is null then
    raise exception 'Certificado bloqueado: laudo sem resultado classificado.';
  end if;

  select coalesce(required, false), microscopy_result, culture_result, final_report_on
    into v_required, v_micro, v_culture, v_final
    from public.sputum_exams where case_id = new.case_id;

  -- Escarro indicado pela classificação da CXR ou por decisão clínica.
  if v_result = 'tb_ativa_ou_antiga' or coalesce(v_required, false) then
    if v_micro = 'positivo' or v_culture = 'positivo' then
      raise exception 'Certificado bloqueado: exame de escarro positivo.';
    end if;
    if v_final is null then
      raise exception 'Certificado bloqueado: escarro indicado, mas sem laudo final negativo.';
    end if;
    new.after_sputum := true;
  end if;

  return new;
end $$;

create trigger trg_certificate_rules
before insert or update on public.certificates
for each row execute function public.enforce_certificate_rules();

-- ---------------------------------------------------------------- auditoria
create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare
  v_row jsonb;
  v_actor uuid := auth.uid();
  v_email text;
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

  select email into v_email from auth.users where id = v_actor;

  insert into public.audit_log (table_name, row_id, action, actor, actor_email, changed)
  values (
    tg_table_name,
    coalesce((v_row ->> 'id')::uuid, (v_row ->> 'case_id')::uuid),
    tg_op,
    v_actor,
    v_email,
    v_row
  );

  return case when tg_op = 'DELETE' then old else new end;
end $$;

-- ---------------------------------------------------------------- updated_at triggers
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_applicants_updated on public.applicants;
create trigger trg_applicants_updated before update on public.applicants
for each row execute function public.set_updated_at();

drop trigger if exists trg_cases_updated on public.cases;
create trigger trg_cases_updated before update on public.cases
for each row execute function public.set_updated_at();

drop trigger if exists trg_consents_updated on public.consents;
create trigger trg_consents_updated before update on public.consents
for each row execute function public.set_updated_at();

drop trigger if exists trg_screening_updated on public.medical_screenings;
create trigger trg_screening_updated before update on public.medical_screenings
for each row execute function public.set_updated_at();

drop trigger if exists trg_reports_updated on public.radiology_reports;
create trigger trg_reports_updated before update on public.radiology_reports
for each row execute function public.set_updated_at();

drop trigger if exists trg_sputum_updated on public.sputum_exams;
create trigger trg_sputum_updated before update on public.sputum_exams
for each row execute function public.set_updated_at();

drop trigger if exists trg_treatments_updated on public.treatments;
create trigger trg_treatments_updated before update on public.treatments
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- retenção triggers
do $$
declare t text;
begin
  foreach t in array array[
    'consents','medical_screenings','chest_xrays','radiology_reports',
    'sputum_exams','referrals','treatments','certificates','disclosures','case_documents'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_retention on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_retention after insert or update on public.%1$s
       for each row execute function public.recalc_retention()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- auditoria triggers
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','applicants','cases','consents','medical_screenings','chest_xrays',
    'radiology_reports','sputum_exams','referrals','treatments','certificates',
    'disclosures','case_documents'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_audit on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_audit after insert or update or delete on public.%1$s
       for each row execute function public.log_audit()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- visão
create or replace view public.v_case_overview
with (security_invoker = on) as
select
  c.id,
  c.case_number,
  c.status,
  c.category,
  c.opened_on,
  c.assessment_date,
  c.retention_until,
  c.assigned_physician,
  c.family_group_id,
  a.id as applicant_id,
  a.full_name,
  a.date_of_birth,
  a.passport_number,
  a.passport_country,
  coalesce(ic.done, 0) as identity_checks_done,
  coalesce(cs.signed, false) as consent_signed,
  (ms.case_id is not null) as screening_done,
  cx.id as current_cxr_id,
  cx.performed_on as cxr_on,
  (cx.id is not null) as cxr_done,
  rr.case_id is not null as report_done,
  coalesce(rr.pp_reviewed, false) as pp_reviewed,
  rr.result as cxr_result,
  coalesce(se.required, false) as sputum_required,
  case
    when se.case_id is null then null
    when se.microscopy_result = 'positivo' or se.culture_result = 'positivo' then 'positivo'
    when se.final_report_on is not null then 'negativo'
    else 'em_andamento'
  end as sputum_status,
  se.started_on as sputum_started_on,
  case when cx.performed_on is not null then cx.performed_on + 7 else null end as sputum_deadline,
  exists (select 1 from public.certificates ce where ce.case_id = c.id and ce.issued) as certificate_issued,
  (select count(*) from public.case_documents d where d.case_id = c.id) as documents_count,
  -- mínimo britânico, apenas informativo
  case when c.assessment_date is not null then (c.assessment_date + interval '3 years')::timestamptz else null end as uk_retention_until
from public.cases c
join public.applicants a on a.id = c.applicant_id
left join lateral (
  select count(*) filter (where is_checked) as done
  from public.identity_checks where case_id = c.id
) ic on true
left join public.consents cs on cs.case_id = c.id
left join public.medical_screenings ms on ms.case_id = c.id
left join public.chest_xrays cx on cx.case_id = c.id and cx.is_current
left join public.radiology_reports rr on rr.case_id = c.id
left join public.sputum_exams se on se.case_id = c.id;

grant select on public.v_case_overview to authenticated;
