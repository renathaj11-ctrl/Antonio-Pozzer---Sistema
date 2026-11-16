import type { CaseBundle } from "@/lib/types";
import { Alert, Card, Empty } from "@/components/ui";
import { brDateTime, fileSize } from "@/lib/format";
import { Uploader } from "./uploader";

const DOC_LABELS: Record<string, string> = {
  passaporte: "Passaporte / identidade",
  consentimento: "Consentimento",
  cxr_dicom: "Radiografia (DICOM)",
  cxr_imagem: "Radiografia (imagem)",
  laudo: "Laudo radiológico",
  escarro: "Resultado de escarro",
  encaminhamento: "Encaminhamento",
  tratamento: "Relatório de tratamento",
  certificado: "Certificado",
  outro: "Outro",
};

export function DocumentosTab({ bundle, canUpload }: { bundle: CaseBundle; canUpload: boolean }) {
  const documents = bundle.documents;

  return (
    <div className="grid grid-side">
      <Card title="Arquivos do caso" subtitle={`${documents.length} documento(s) anexado(s).`} tight>
        {documents.length === 0 ? (
          <Empty title="Nenhum arquivo anexado">
            Anexe passaporte, consentimento assinado, DICOM, laudo e resultados.
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Arquivo</th>
                  <th>Tamanho</th>
                  <th>Enviado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td className="small">{DOC_LABELS[document.doc_type] ?? document.doc_type}</td>
                    <td>
                      <div className="primary" style={{ wordBreak: "break-word" }}>{document.file_name}</div>
                      <div className="sub mono">{document.mime_type ?? "—"}</div>
                    </td>
                    <td className="small nowrap">{fileSize(document.size_bytes)}</td>
                    <td className="small muted nowrap">{brDateTime(document.uploaded_at)}</td>
                    <td className="right nowrap">
                      <a
                        className="btn btn-sm"
                        href={`/api/arquivo?path=${encodeURIComponent(document.storage_path)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir
                      </a>
                      <a
                        className="btn btn-sm"
                        style={{ marginLeft: 6 }}
                        href={`/api/arquivo?path=${encodeURIComponent(document.storage_path)}&download=1`}
                      >
                        Baixar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="stack">
        {canUpload ? (
          <Card title="Anexar arquivo" subtitle="O envio vai direto ao Supabase Storage, sem passar pela Vercel.">
            <Uploader caseId={bundle.detail.id} />
          </Card>
        ) : (
          <Alert tone="info">
            Seu perfil pode consultar os documentos, mas não anexar novos arquivos.
          </Alert>
        )}

        <Card title="Boas práticas">
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Um único original por documento; não anexe cópias duplicadas.</li>
            <li>Use nomes de arquivo sem dados clínicos desnecessários.</li>
            <li>DICOM: mantenha o estudo completo, sem recompressão.</li>
            <li>O sistema guarda o hash SHA-256 do arquivo enviado.</li>
            <li>Exclusão de arquivo é restrita ao administrador, com registro em auditoria.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
