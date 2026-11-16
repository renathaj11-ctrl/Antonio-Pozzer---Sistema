"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { registrarDocumento } from "@/lib/actions/documentos";

const DOC_TYPES = [
  { value: "passaporte", label: "Passaporte / documento de identidade" },
  { value: "consentimento", label: "Consentimento informado assinado" },
  { value: "cxr_dicom", label: "Radiografia — DICOM" },
  { value: "cxr_imagem", label: "Radiografia — imagem (JPG/PNG)" },
  { value: "laudo", label: "Laudo radiológico" },
  { value: "escarro", label: "Resultado de escarro" },
  { value: "encaminhamento", label: "Carta de encaminhamento" },
  { value: "tratamento", label: "Relatório de tratamento" },
  { value: "certificado", label: "Certificado emitido (via assinada)" },
  { value: "outro", label: "Outro documento" },
];

export function Uploader({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    const docType = String(data.get("doc_type") ?? "outro");

    setError(null);
    setStatus(null);

    if (!(file instanceof File) || file.size === 0) {
      setError("Selecione um arquivo.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("O arquivo excede 50 MB. Para DICOM maior, use o PACS ou divida o exame.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createBrowserSupabase();
      const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
      const path = `${caseId}/${Date.now()}-${safeName}`;

      setStatus("Preparando envio seguro…");
      const { data: signed, error: signError } = await supabase.storage
        .from("casos")
        .createSignedUploadUrl(path);
      if (signError) throw signError;

      setStatus("Enviando arquivo…");
      const { error: uploadError } = await supabase.storage
        .from("casos")
        .uploadToSignedUrl(path, signed.token, file, {
          contentType: file.type || "application/octet-stream",
        });
      if (uploadError) throw uploadError;

      let sha256: string | null = null;
      try {
        const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        sha256 = Array.from(new Uint8Array(digest))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
      } catch {
        sha256 = null;
      }

      setStatus("Registrando no prontuário…");
      const result = await registrarDocumento({
        caseId,
        docType,
        path,
        fileName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
        sha256,
      });
      if (result.error) throw new Error(result.error);

      form.reset();
      setStatus("Arquivo anexado com sucesso.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha no envio do arquivo.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="form-grid">
        <label className="field">
          <span>Tipo de documento</span>
          <select name="doc_type" defaultValue="laudo">
            {DOC_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Arquivo</span>
          <input
            type="file"
            name="file"
            required
            accept=".pdf,.jpg,.jpeg,.png,.dcm,application/pdf,image/jpeg,image/png,application/dicom,application/octet-stream"
          />
          <small>PDF, JPG, PNG ou DICOM. Limite de 50 MB por arquivo.</small>
        </label>
      </div>

      {error && <div className="alert alert-danger"><strong>×</strong><div>{error}</div></div>}
      {status && !error && <div className="alert alert-info"><strong>i</strong><div>{status}</div></div>}

      <div className="row-end">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Enviando…" : "Anexar arquivo"}
        </button>
      </div>
    </form>
  );
}
