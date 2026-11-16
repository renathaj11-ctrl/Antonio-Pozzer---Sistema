-- =============================================================================
-- Dados iniciais
-- =============================================================================

insert into public.clinics (name, city, country)
select 'Antonio Pozzer · Consultório Médico para Imigração', 'Porto Alegre', 'Brasil'
where not exists (select 1 from public.clinics);

insert into public.app_settings (key, value) values
  ('retention', '{"local_years": 20, "uk_minimum_years": 3, "trigger": "ultimo_registro"}'::jsonb),
  ('certificate', '{"validity_months": 6, "family_validity_months": 3, "family_rule_version": "UKTBTI v7"}'::jsonb),
  ('sputum', '{"start_within_days": 7, "samples": 3, "min_interval_hours": 24}'::jsonb)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- PRIMEIRO ADMINISTRADOR
-- 1. Crie o usuário em Authentication > Users (e-mail + senha).
-- 2. Copie o UUID e rode, trocando os valores:
--
-- insert into public.profiles (id, full_name, role)
-- values ('00000000-0000-0000-0000-000000000000', 'Nome do médico', 'admin');
--
-- Papéis: admin | medico | radiologista | secretaria | enfermeiro | auditor
-- -----------------------------------------------------------------------------
