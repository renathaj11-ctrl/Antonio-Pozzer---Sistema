"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { bool, errorMessage, list, req, str } from "@/lib/form";
import type { CaseStatus } from "@/lib/types";

const CATEGORIES = ["adulto", "gestante", "crianca"] as const;
const ID_STAGES = ["registro", "exame_medico", "cxr", "escarro", "certificado"] as const;
const NOT_ISSUED_REASONS = [
  "tb_confirmada_ou_suspeita",
  "teste_adiado",
  "desistencia",
  "processo_incompleto",
] as const;
const ALL_STATUSES: CaseStatus[] = [
  "rascunho", "em_triagem", "aguardando_cxr", "aguardando_laudo", "aguardando_escarro",
  "aguardando_resultado", "apto_certificado", "certificado_emitido", "encaminhado",
  "em_tratamento", "encerrado", "cancelado",
];

function go(caseId: string, tab: string, kind: "ok" | "erro", message: string): never {
  const query = new URLSearchParams({ tab, [kind]: message });
  redirect(`/casos/${caseId}?${query.toString()}`);
}

function fail(tab: string, message: string): never {
  redirect(`/casos/novo?erro=${encodeURIComponent(message)}`);
}

async function setStatus(supabase: SupabaseClient, caseId: string, status: CaseStatus) {
  // Radiologista não tem permissão de UPDATE em cases: a falha é silenciosa
  // e o status é ajustado depois pelo médico/secretaria.
  await supabase.from("cases").update({ status }).eq("id", caseId);
}

/** Só altera o status se o caso ainda estiver em uma das fases esperadas. */
async function setStatusIf(
  supabase: SupabaseClient,
  caseId: string,
  status: CaseStatus,
  allowed: CaseStatus[],
) {
  await supabase.from("cases").update({ status }).eq("id", caseId).in("status", allowed);
}

async function logEvent(
  supabase: SupabaseClient,
  caseId: string,
  actor: string,
  eventType: string,
  description: string,
) {
  await supabase.from("case_events").insert({
    case_id: caseId,
    event_type: eventType,
    description,
    actor,
  });
}

/* ------------------------------------------------------------------ criar */

export async function criarCaso(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();

  let caseId: string | null = null;
  let failure: string | null = null;

  try {
    const fullName = req(formData, "full_name");
    const dateOfBirth = req(formData, "date_of_birth");
    const passport = req(formData, "passport_number");
    if (!fullName) throw new Error("Informe o nome completo do requerente.");
    if (!dateOfBirth) throw new Error("Informe a data de nascimento.");
    if (!passport) throw new Error("Informe o número do passaporte.");

    const categoryRaw = req(formData, "category");
    const category = (CATEGORIES as readonly string[]).includes(categoryRaw) ? categoryRaw : "adulto";

    let clinicId = str(formData, "clinic_id");
    if (!clinicId) {
      const { data: clinic } = await supabase.from("clinics").select("id").eq("active", true).limit(1).maybeSingle();
      clinicId = clinic?.id ?? null;
    }
    if (!clinicId) throw new Error("Nenhuma clínica ativa cadastrada. Cadastre a clínica em Configurações.");

    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .insert({
        full_name: fullName,
        date_of_birth: dateOfBirth,
        sex: str(formData, "sex"),
        nationality: str(formData, "nationality"),
        passport_number: passport,
        passport_country: str(formData, "passport_country"),
        passport_issued_on: str(formData, "passport_issued_on"),
        passport_expires_on: str(formData, "passport_expires_on"),
        phone: str(formData, "phone"),
        email: str(formData, "email"),
        address_line: str(formData, "address_line"),
        city: str(formData, "city"),
        state: str(formData, "state"),
        postcode: str(formData, "postcode"),
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (applicantError) throw applicantError;

    let familyGroupId: string | null = null;
    const familyLabel = str(formData, "family_label");
    if (familyLabel) {
      const { data: group, error: groupError } = await supabase
        .from("family_groups")
        .insert({ label: familyLabel })
        .select("id")
        .single();
      if (groupError) throw groupError;
      familyGroupId = group.id;
    }

    const assessed = str(formData, "assessment_date");
    const { data: created, error: caseError } = await supabase
      .from("cases")
      .insert({
        applicant_id: applicant.id,
        clinic_id: clinicId,
        family_group_id: familyGroupId,
        category,
        status: assessed ? "em_triagem" : "rascunho",
        opened_on: str(formData, "opened_on") ?? new Date().toISOString().slice(0, 10),
        assessment_date: assessed,
        assigned_physician: profile.role === "medico" ? profile.id : str(formData, "assigned_physician"),
        notes: str(formData, "notes"),
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (caseError) throw caseError;

    caseId = created.id;
    await logEvent(supabase, created.id, profile.id, "caso_criado", "Caso aberto no sistema.");
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure || !caseId) fail("resumo", failure ?? "Não foi possível criar o caso.");

  revalidatePath("/casos");
  revalidatePath("/painel");
  go(caseId, "consentimento", "ok", "Caso criado. Registre o consentimento informado.");
}

/* ------------------------------------------------------------------ dados gerais */

export async function salvarCaso(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");

  let failure: string | null = null;
  try {
    const { data: current, error: readError } = await supabase
      .from("cases")
      .select("applicant_id")
      .eq("id", caseId)
      .single();
    if (readError) throw readError;

    const fullName = req(formData, "full_name");
    const passport = req(formData, "passport_number");
    if (!fullName || !passport) throw new Error("Nome e passaporte são obrigatórios.");

    const { error: applicantError } = await supabase
      .from("applicants")
      .update({
        full_name: fullName,
        date_of_birth: req(formData, "date_of_birth"),
        sex: str(formData, "sex"),
        nationality: str(formData, "nationality"),
        passport_number: passport,
        passport_country: str(formData, "passport_country"),
        passport_issued_on: str(formData, "passport_issued_on"),
        passport_expires_on: str(formData, "passport_expires_on"),
        phone: str(formData, "phone"),
        email: str(formData, "email"),
        address_line: str(formData, "address_line"),
        city: str(formData, "city"),
        state: str(formData, "state"),
        postcode: str(formData, "postcode"),
      })
      .eq("id", current.applicant_id);
    if (applicantError) throw applicantError;

    const categoryRaw = req(formData, "category");
    const { error: caseError } = await supabase
      .from("cases")
      .update({
        category: (CATEGORIES as readonly string[]).includes(categoryRaw) ? categoryRaw : "adulto",
        assessment_date: str(formData, "assessment_date"),
        assigned_physician: str(formData, "assigned_physician"),
        notes: str(formData, "notes"),
      })
      .eq("id", caseId);
    if (caseError) throw caseError;

    await logEvent(supabase, caseId, profile.id, "dados_atualizados", "Dados do caso e do requerente atualizados.");
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "resumo", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "resumo", "ok", "Dados salvos.");
}

export async function alterarStatus(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");
  const status = req(formData, "status") as CaseStatus;

  if (!ALL_STATUSES.includes(status)) go(caseId, "resumo", "erro", "Status inválido.");

  const patch: Record<string, unknown> = { status };
  if (status === "encerrado" || status === "cancelado") patch.closed_at = new Date().toISOString();

  const { error } = await supabase.from("cases").update(patch).eq("id", caseId);
  if (error) go(caseId, "resumo", "erro", error.message);

  await logEvent(supabase, caseId, profile.id, "status", `Status alterado para ${status}.`);
  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/casos");
  revalidatePath("/painel");
  go(caseId, "resumo", "ok", "Status atualizado.");
}

/* ------------------------------------------------------------------ identidade */

export async function salvarIdentidade(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");

  const documentType = str(formData, "document_type");
  const documentNumber = str(formData, "document_number");
  const notes = str(formData, "notes");

  const rows = ID_STAGES.map((stage) => {
    const checked = bool(formData, `stage_${stage}`);
    return {
      case_id: caseId,
      stage,
      is_checked: checked,
      checked_at: checked ? new Date().toISOString() : null,
      checked_by: checked ? profile.id : null,
      document_type: documentType,
      document_number: documentNumber,
      notes,
    };
  });

  let failure: string | null = null;
  try {
    const { error } = await supabase
      .from("identity_checks")
      .upsert(rows, { onConflict: "case_id,stage" });
    if (error) throw error;

    await logEvent(
      supabase,
      caseId,
      profile.id,
      "identidade",
      `Verificação de identidade: ${rows.filter((r) => r.is_checked).length}/5 estágios confirmados.`,
    );
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "identidade", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "identidade", "ok", "Verificações de identidade salvas.");
}

/* ------------------------------------------------------------------ consentimento */

export async function salvarConsentimento(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");

  let failure: string | null = null;
  try {
    const { error } = await supabase.from("consents").upsert(
      {
        case_id: caseId,
        signed: bool(formData, "signed"),
        signed_on: str(formData, "signed_on"),
        form_version: str(formData, "form_version"),
        language: str(formData, "language") ?? "Português",
        explained_by: str(formData, "explained_by"),
        interpreter_name: str(formData, "interpreter_name"),
        pregnant_option: str(formData, "pregnant_option"),
        withdrawal_on: str(formData, "withdrawal_on"),
        withdrawal_reason: str(formData, "withdrawal_reason"),
      },
      { onConflict: "case_id" },
    );
    if (error) throw error;

    await logEvent(
      supabase,
      caseId,
      profile.id,
      "consentimento",
      bool(formData, "signed") ? "Consentimento informado registrado." : "Consentimento atualizado (não assinado).",
    );
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "consentimento", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "consentimento", "ok", "Consentimento salvo.");
}

/* ------------------------------------------------------------------ triagem */

export async function salvarTriagem(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");

  const xrayRequired = bool(formData, "xray_required");
  let failure: string | null = null;

  try {
    const { error } = await supabase.from("medical_screenings").upsert(
      {
        case_id: caseId,
        screened_on: str(formData, "screened_on"),
        symptoms: list(formData, "symptoms"),
        symptom_details: str(formData, "symptom_details"),
        previous_tb: bool(formData, "previous_tb"),
        previous_tb_details: str(formData, "previous_tb_details"),
        contact_tb: bool(formData, "contact_tb"),
        contact_details: str(formData, "contact_details"),
        household_tb: bool(formData, "household_tb"),
        physical_exam: str(formData, "physical_exam"),
        pregnant: bool(formData, "pregnant"),
        lmp: str(formData, "lmp"),
        clinical_decision: str(formData, "clinical_decision"),
        xray_required: xrayRequired,
        xray_not_required_reason: str(formData, "xray_not_required_reason"),
        created_by: profile.id,
      },
      { onConflict: "case_id" },
    );
    if (error) throw error;

    await setStatusIf(supabase, caseId, xrayRequired ? "aguardando_cxr" : "em_triagem", [
      "rascunho",
      "em_triagem",
      "aguardando_cxr",
    ]);
    await logEvent(supabase, caseId, profile.id, "triagem", "Triagem clínica registrada.");
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "triagem", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "triagem", "ok", "Triagem clínica salva.");
}

/* ------------------------------------------------------------------ CXR */

export async function salvarCxr(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");
  const cxrId = str(formData, "cxr_id");
  const performedOn = req(formData, "performed_on");

  let failure: string | null = null;
  try {
    if (!performedOn) throw new Error("Informe a data da radiografia.");

    const payload = {
      performed_on: performedOn,
      views: list(formData, "views").length ? list(formData, "views") : ["PA"],
      facility: str(formData, "facility"),
      radiographer: str(formData, "radiographer"),
      image_quality: str(formData, "image_quality"),
      repeat_reason: str(formData, "repeat_reason"),
      is_current: true,
    };

    if (cxrId) {
      const { error } = await supabase.from("chest_xrays").update(payload).eq("id", cxrId).eq("case_id", caseId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("chest_xrays")
        .insert({ ...payload, case_id: caseId, created_by: profile.id });
      if (error) throw error;
    }

    await setStatusIf(supabase, caseId, "aguardando_laudo", [
      "rascunho",
      "em_triagem",
      "aguardando_cxr",
    ]);
    await logEvent(supabase, caseId, profile.id, "cxr", `Radiografia registrada em ${performedOn}.`);
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "cxr", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "cxr", "ok", "Radiografia salva. Aguardando laudo.");
}

/* ------------------------------------------------------------------ laudo */

export async function salvarLaudo(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");
  const result = str(formData, "result");
  const reviewed = bool(formData, "pp_reviewed");

  let failure: string | null = null;
  try {
    const { error } = await supabase.from("radiology_reports").upsert(
      {
        case_id: caseId,
        reported_on: str(formData, "reported_on"),
        radiologist_name: str(formData, "radiologist_name"),
        radiologist_registry: str(formData, "radiologist_registry"),
        findings_codes: list(formData, "findings_codes"),
        result,
        description: str(formData, "description"),
        compared_previous: bool(formData, "compared_previous"),
        previous_reference: str(formData, "previous_reference"),
        pp_reviewed: reviewed,
        pp_reviewed_on: reviewed ? (str(formData, "pp_reviewed_on") ?? new Date().toISOString().slice(0, 10)) : null,
        pp_review_notes: str(formData, "pp_review_notes"),
      },
      { onConflict: "case_id" },
    );
    if (error) throw error;

    if (result === "tb_ativa_ou_antiga") {
      const { error: sputumError } = await supabase.from("sputum_exams").upsert(
        {
          case_id: caseId,
          required: true,
          reason: "Radiografia compatível com TB ativa ou antiga.",
        },
        { onConflict: "case_id" },
      );
      if (sputumError) throw sputumError;
      await setStatusIf(supabase, caseId, "aguardando_escarro", [
        "rascunho",
        "em_triagem",
        "aguardando_cxr",
        "aguardando_laudo",
        "aguardando_escarro",
      ]);
    } else if (result) {
      await setStatusIf(supabase, caseId, reviewed ? "apto_certificado" : "aguardando_laudo", [
        "rascunho",
        "em_triagem",
        "aguardando_cxr",
        "aguardando_laudo",
        "aguardando_escarro",
        "aguardando_resultado",
        "apto_certificado",
      ]);
    }

    await logEvent(supabase, caseId, profile.id, "laudo", "Laudo radiológico registrado.");
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "laudo", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "laudo", "ok", "Laudo radiológico salvo.");
}

/* ------------------------------------------------------------------ escarro */

export async function salvarEscarro(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");

  const samples = [1, 2, 3]
    .map((n) => ({
      n,
      date: str(formData, `sample_date_${n}`),
      time: str(formData, `sample_time_${n}`),
      volume_ml: str(formData, `sample_volume_${n}`),
      quality: str(formData, `sample_quality_${n}`),
    }))
    .filter((sample) => sample.date || sample.time || sample.volume_ml || sample.quality);

  const finalReport = str(formData, "final_report_on");
  const microscopy = str(formData, "microscopy_result");
  const culture = str(formData, "culture_result");
  const positive = microscopy === "positivo" || culture === "positivo";

  let failure: string | null = null;
  try {
    const { error } = await supabase.from("sputum_exams").upsert(
      {
        case_id: caseId,
        required: bool(formData, "required"),
        reason: str(formData, "reason"),
        planned_start_on: str(formData, "planned_start_on"),
        started_on: str(formData, "started_on"),
        samples,
        lab_name: str(formData, "lab_name"),
        lab_accreditation: str(formData, "lab_accreditation"),
        sent_at: str(formData, "sent_at"),
        received_at: str(formData, "received_at"),
        processed_at: str(formData, "processed_at"),
        microscopy_result: microscopy,
        culture_result: culture,
        dst_result: str(formData, "dst_result"),
        final_report_on: finalReport,
        positive_notified_on: str(formData, "positive_notified_on"),
        notes: str(formData, "notes"),
      },
      { onConflict: "case_id" },
    );
    if (error) throw error;

    if (positive) {
      await setStatus(supabase, caseId, "encaminhado");
    } else if (finalReport) {
      await setStatusIf(supabase, caseId, "apto_certificado", [
        "em_triagem",
        "aguardando_cxr",
        "aguardando_laudo",
        "aguardando_escarro",
        "aguardando_resultado",
        "apto_certificado",
      ]);
    } else if (bool(formData, "required")) {
      await setStatusIf(supabase, caseId, "aguardando_resultado", [
        "em_triagem",
        "aguardando_cxr",
        "aguardando_laudo",
        "aguardando_escarro",
      ]);
    }

    await logEvent(
      supabase,
      caseId,
      profile.id,
      "escarro",
      positive ? "Resultado de escarro positivo." : finalReport ? "Resultado final de escarro registrado." : "Coleta de escarro atualizada.",
    );
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "escarro", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "escarro", "ok", "Exame de escarro salvo.");
}

/* ------------------------------------------------------------------ desfecho */

export async function emitirCertificado(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");
  const issuedOn = req(formData, "issued_on");

  let failure: string | null = null;
  try {
    if (!issuedOn) throw new Error("Informe a data de emissão.");

    const { error } = await supabase.from("certificates").insert({
      case_id: caseId,
      issued: true,
      number: str(formData, "number"),
      issued_on: issuedOn,
      expires_on: str(formData, "expires_on"),
      after_sputum: bool(formData, "after_sputum"),
      comments: str(formData, "comments"),
      pets_reference: str(formData, "pets_reference"),
      issued_by: profile.id,
    });
    if (error) throw error;

    await setStatus(supabase, caseId, "certificado_emitido");
    await logEvent(supabase, caseId, profile.id, "certificado", "Certificado de triagem emitido.");
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "desfecho", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  revalidatePath("/painel");
  go(caseId, "desfecho", "ok", "Certificado emitido.");
}

export async function registrarNaoEmissao(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");
  const reason = req(formData, "not_issued_reason");

  if (!(NOT_ISSUED_REASONS as readonly string[]).includes(reason)) {
    go(caseId, "desfecho", "erro", "Selecione o motivo da não emissão.");
  }

  let failure: string | null = null;
  try {
    const { error } = await supabase.from("certificates").insert({
      case_id: caseId,
      issued: false,
      not_issued_reason: reason,
      comments: str(formData, "comments"),
      issued_by: profile.id,
    });
    if (error) throw error;

    if (reason === "tb_confirmada_ou_suspeita") await setStatus(supabase, caseId, "encaminhado");
    if (reason === "desistencia") await setStatus(supabase, caseId, "cancelado");
    await logEvent(supabase, caseId, profile.id, "certificado", `Certificado não emitido: ${reason}.`);
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "desfecho", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "desfecho", "ok", "Não emissão registrada.");
}

export async function registrarEncaminhamento(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");

  let failure: string | null = null;
  try {
    const { error } = await supabase.from("referrals").insert({
      case_id: caseId,
      referred_on: str(formData, "referred_on") ?? new Date().toISOString().slice(0, 10),
      reason: list(formData, "reason"),
      advised_treatment: bool(formData, "advised_treatment"),
      local_notified: bool(formData, "local_notified"),
      local_notified_on: str(formData, "local_notified_on"),
      uk_notified: bool(formData, "uk_notified"),
      uk_notified_on: str(formData, "uk_notified_on"),
      created_by: profile.id,
    });
    if (error) throw error;

    await setStatus(supabase, caseId, "encaminhado");
    await logEvent(supabase, caseId, profile.id, "encaminhamento", "Encaminhamento para tratamento registrado.");
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "desfecho", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "desfecho", "ok", "Encaminhamento registrado.");
}

export async function salvarTratamento(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();
  const caseId = req(formData, "case_id");
  const startedOn = str(formData, "started_on");
  const endedOn = str(formData, "ended_on");

  let failure: string | null = null;
  try {
    const { error } = await supabase.from("treatments").upsert(
      {
        case_id: caseId,
        provider: str(formData, "provider"),
        regimen: str(formData, "regimen"),
        started_on: startedOn,
        ended_on: endedOn,
        adherence: str(formData, "adherence"),
        outcome: str(formData, "outcome"),
      },
      { onConflict: "case_id" },
    );
    if (error) throw error;

    if (startedOn) await setStatus(supabase, caseId, endedOn ? "encerrado" : "em_tratamento");
    await logEvent(supabase, caseId, profile.id, "tratamento", "Dados de tratamento atualizados.");
  } catch (error) {
    failure = errorMessage(error);
  }

  if (failure) go(caseId, "desfecho", "erro", failure);
  revalidatePath(`/casos/${caseId}`);
  go(caseId, "desfecho", "ok", "Tratamento salvo.");
}
