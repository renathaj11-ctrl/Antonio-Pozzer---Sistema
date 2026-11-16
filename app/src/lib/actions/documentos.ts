"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { errorMessage } from "@/lib/form";

export async function registrarDocumento(input: {
  caseId: string;
  docType: string;
  path: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number;
  sha256?: string | null;
}): Promise<{ error?: string }> {
  const { profile } = await requireProfile();
  const supabase = await createServerSupabase();

  if (!input.path.startsWith(`${input.caseId}/`)) {
    return { error: "Caminho de arquivo inválido para este caso." };
  }

  const { error } = await supabase.from("case_documents").insert({
    case_id: input.caseId,
    doc_type: input.docType,
    file_name: input.fileName,
    storage_path: input.path,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    sha256: input.sha256 ?? null,
    uploaded_by: profile.id,
  });

  if (error) return { error: error.message };

  await supabase.from("case_events").insert({
    case_id: input.caseId,
    event_type: "documento",
    description: `Documento anexado: ${input.fileName}`,
    actor: profile.id,
  });

  revalidatePath(`/casos/${input.caseId}`);
  return {};
}
