-- =============================================================================
-- Segurança: funções de papel, RLS e Storage
-- =============================================================================

create or replace function public.current_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active)
$$;

create or replace function public.has_role(p_roles public.user_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and active and role = any (p_roles)
  )
$$;

revoke all on function public.current_role() from public;
revoke all on function public.is_staff() from public;
revoke all on function public.has_role(public.user_role[]) from public;
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.has_role(public.user_role[]) to authenticated;

-- ---------------------------------------------------------------- RLS
do $$
declare t text;
begin
  foreach t in array array[
    'clinics','profiles','applicants','family_groups','cases','identity_checks','consents',
    'medical_screenings','chest_xrays','radiology_reports','sputum_exams','referrals',
    'treatments','certificates','disclosures','case_documents','case_events','audit_log',
    'app_settings','case_counters'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
with check (public.has_role(array['admin']::public.user_role[]));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
using (id = auth.uid() or public.has_role(array['admin']::public.user_role[]))
with check (id = auth.uid() or public.has_role(array['admin']::public.user_role[]));

-- Impede autopromoção de papel e autoativação por quem não é admin.
create or replace function public.guard_profile_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_admin boolean;
begin
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'admin' and active
  ) into v_admin;

  if not coalesce(v_admin, false) then
    if new.role is distinct from old.role then
      raise exception 'Apenas administradores podem alterar papéis.';
    end if;
    if new.active is distinct from old.active then
      raise exception 'Apenas administradores podem ativar ou desativar perfis.';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard
before update on public.profiles
for each row execute function public.guard_profile_changes();

-- clínicas e configurações
drop policy if exists clinics_select on public.clinics;
create policy clinics_select on public.clinics for select to authenticated using (public.is_staff());

drop policy if exists clinics_admin on public.clinics;
create policy clinics_admin on public.clinics for all to authenticated
using (public.has_role(array['admin']::public.user_role[]))
with check (public.has_role(array['admin']::public.user_role[]));

drop policy if exists settings_select on public.app_settings;
create policy settings_select on public.app_settings for select to authenticated using (public.is_staff());

drop policy if exists settings_admin on public.app_settings;
create policy settings_admin on public.app_settings for all to authenticated
using (public.has_role(array['admin']::public.user_role[]))
with check (public.has_role(array['admin']::public.user_role[]));

-- tabelas clínicas: leitura para toda a equipe
do $$
declare t text;
begin
  foreach t in array array[
    'applicants','family_groups','cases','identity_checks','consents','medical_screenings',
    'chest_xrays','radiology_reports','sputum_exams','referrals','treatments','certificates',
    'disclosures','case_documents','case_events'
  ]
  loop
    execute format('drop policy if exists %1$s_select on public.%1$s', t);
    execute format(
      'create policy %1$s_select on public.%1$s for select to authenticated using (public.is_staff())', t);
  end loop;
end $$;

-- escrita: equipe clínica
do $$
declare t text;
begin
  foreach t in array array[
    'applicants','family_groups','cases','identity_checks','consents','medical_screenings',
    'sputum_exams','referrals','treatments','disclosures','case_documents','case_events'
  ]
  loop
    execute format('drop policy if exists %1$s_write on public.%1$s', t);
    execute format(
      'create policy %1$s_write on public.%1$s for insert to authenticated
       with check (public.has_role(array[''admin'',''medico'',''secretaria'',''enfermeiro'']::public.user_role[]))', t);
    execute format('drop policy if exists %1$s_update on public.%1$s', t);
    execute format(
      'create policy %1$s_update on public.%1$s for update to authenticated
       using (public.has_role(array[''admin'',''medico'',''secretaria'',''enfermeiro'']::public.user_role[]))
       with check (public.has_role(array[''admin'',''medico'',''secretaria'',''enfermeiro'']::public.user_role[]))', t);
  end loop;
end $$;

-- radiologia: inclui radiologista
do $$
declare t text;
begin
  foreach t in array array['chest_xrays','radiology_reports']
  loop
    execute format('drop policy if exists %1$s_write on public.%1$s', t);
    execute format(
      'create policy %1$s_write on public.%1$s for insert to authenticated
       with check (public.has_role(array[''admin'',''medico'',''radiologista'',''enfermeiro'']::public.user_role[]))', t);
    execute format('drop policy if exists %1$s_update on public.%1$s', t);
    execute format(
      'create policy %1$s_update on public.%1$s for update to authenticated
       using (public.has_role(array[''admin'',''medico'',''radiologista'',''enfermeiro'']::public.user_role[]))
       with check (public.has_role(array[''admin'',''medico'',''radiologista'',''enfermeiro'']::public.user_role[]))', t);
  end loop;
end $$;

-- radiologista também registra arquivos (DICOM e laudo assinado)
drop policy if exists case_documents_radiology on public.case_documents;
create policy case_documents_radiology on public.case_documents for insert to authenticated
with check (public.has_role(array['radiologista']::public.user_role[]));

-- certificados: apenas médico e admin
drop policy if exists certificates_write on public.certificates;create policy certificates_write on public.certificates for insert to authenticated
with check (public.has_role(array['admin','medico']::public.user_role[]));

drop policy if exists certificates_update on public.certificates;
create policy certificates_update on public.certificates for update to authenticated
using (public.has_role(array['admin','medico']::public.user_role[]))
with check (public.has_role(array['admin','medico']::public.user_role[]));

-- auditoria: leitura restrita; escrita só pelo trigger (security definer)
drop policy if exists audit_read on public.audit_log;
create policy audit_read on public.audit_log for select to authenticated
using (public.has_role(array['admin','auditor']::public.user_role[]));

drop policy if exists counters_admin on public.case_counters;
create policy counters_admin on public.case_counters for all to authenticated
using (public.has_role(array['admin']::public.user_role[]))
with check (public.has_role(array['admin']::public.user_role[]));

-- ninguém recebe DELETE por política: exclusão é sempre bloqueada.
-- O descarte legal é feito por rotina administrativa com service_role.

-- ---------------------------------------------------------------- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'casos', 'casos', false, 52428800,
  array['application/pdf','image/jpeg','image/png','application/dicom','application/octet-stream']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "casos leitura equipe" on storage.objects;
create policy "casos leitura equipe" on storage.objects for select to authenticated
using (bucket_id = 'casos' and public.is_staff());

drop policy if exists "casos upload clinico" on storage.objects;
create policy "casos upload clinico" on storage.objects for insert to authenticated
with check (
  bucket_id = 'casos'
  and public.has_role(array['admin','medico','radiologista','secretaria','enfermeiro']::public.user_role[])
);

drop policy if exists "casos exclusao admin" on storage.objects;
create policy "casos exclusao admin" on storage.objects for delete to authenticated
using (bucket_id = 'casos' and public.has_role(array['admin']::public.user_role[]));
