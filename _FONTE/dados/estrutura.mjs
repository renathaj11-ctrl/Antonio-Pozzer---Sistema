export const estrutura = [
  { codigo: "ADM/01_UKVI", caminho: "00_ADMINISTRATION/01_Home_Office_UKVI", desc: "Designação, condições, versões das TI, tabela de preços, correspondência com UKVI/UKHSA." },
  { codigo: "ADM/02_SOPs", caminho: "00_ADMINISTRATION/02_Policies_SOPs", desc: "SOPs controladas, políticas, formulários-modelo e histórico de versões." },
  { codigo: "ADM/03_Training", caminho: "00_ADMINISTRATION/03_Staff_Training", desc: "Registro profissional, matriz de competência, treinamentos e reciclagens." },
  { codigo: "ADM/04_QA", caminho: "00_ADMINISTRATION/04_Quality_Assurance", desc: "Indicadores, incidentes, CAPA, reclamações, biossegurança e ventilação." },
  { codigo: "ADM/05_Equipment", caminho: "00_ADMINISTRATION/05_Equipment", desc: "Equipamento de raio-X, manutenção, calibração, dosimetria e protocolos técnicos." },
  { codigo: "ADM/06_Lab", caminho: "00_ADMINISTRATION/06_Laboratory", desc: "Contratos, acreditação, DPA, SLA e QA do laboratório e da radiologia." },
  { codigo: "ADM/07_Audit", caminho: "00_ADMINISTRATION/07_Audit", desc: "Plano de auditoria, relatórios, respostas a auditorias externas e pacotes." },
  { codigo: "ADM/08_DPO", caminho: "00_ADMINISTRATION/08_Data_Protection", desc: "Política de privacidade, ROPA, acessos, incidentes de dados e retenção." },
  { codigo: "ACT", caminho: "01_ACTIVE_CASES/{ano}/UKTB-{ano}-{nnnn}", desc: "Casos em andamento, por ano de abertura. O ID é imutável e nunca reutilizado." },
  { codigo: "COMP", caminho: "02_COMPLETED_CASES/{ano}/UKTB-{ano}-{nnnn}", desc: "Casos encerrados, mesma estrutura interna do caso ativo." },
  { codigo: "CASO/00_CONTROLE", caminho: ".../00_CASE_CONTROL", desc: "Checklist de completude, status, categoria, retenção, prazos e trilha do caso." },
  { codigo: "CASO/01_IDENTIDADE", caminho: ".../01_IDENTITY", desc: "Passaporte, verificações por estágio, documento alternativo, acompanhante." },
  { codigo: "CASO/02_CONSENTIMENTO", caminho: ".../02_CONSENT", desc: "Consentimento assinado, tradução, aconselhamento de gestante, retirada." },
  { codigo: "CASO/03_PRONTUARIO", caminho: ".../03_MEDICAL_RECORD", desc: "Anexo G, sintomas, contato, exame físico, decisão clínica do PP." },
  { codigo: "CASO/04_CXR", caminho: ".../04_CHEST_XRAY", desc: "DICOM original, cópia de visualização, hash, registro de repetição." },
  { codigo: "CASO/05_LAUDO", caminho: ".../05_RADIOLOGY_REPORT", desc: "Laudo codificado (Anexo D), comparação com CXR anterior, revisão do PP." },
  { codigo: "CASO/06_ESCARRO", caminho: ".../06_SPUTUM_LAB", desc: "Decisão, coletas, cadeia de custódia, laudo, DST, tentativas alternativas." },
  { codigo: "CASO/07_ENCAMINHAMENTO", caminho: ".../07_REFERRAL", desc: "Carta Anexo H, aconselhamento, comunicação de positivos." },
  { codigo: "CASO/08_TRATAMENTO", caminho: ".../08_TREATMENT", desc: "Plano, prescrições, adesão, desfecho, relatório e re-triagem." },
  { codigo: "CASO/09_CERTIFICADO", caminho: ".../09_TB_CERTIFICATE", desc: "Certificado emitido/não emitido, número, validade, versões e log do PETS." },
  { codigo: "CASO/10_CORRESPONDENCIA", caminho: ".../10_CORRESPONDENCE", desc: "Leaflet, recibos de entrega, comunicações com o candidato." },
  { codigo: "CASO/11_DIVULGACOES", caminho: ".../11_DISCLOSURES", desc: "Notificações e compartilhamentos: quem, quando, para quem, base legal." },
  { codigo: "REG", caminho: "03_REGISTERS", desc: "Master Register e índices: casos, certificados, escarro, referrals, retenção." },
  { codigo: "AUDIT_PACKS", caminho: "04_AUDIT_PACKS", desc: "Pacotes congelados para auditoria externa, com índice e data de geração." },
];

// Estrutura original proposta na conversa -> ajuste recomendado.
export const mapeamento = [
  {
    original: "00_ADMINISTRATION",
    v1: "00_ADMINISTRATION",
    motivo: "Mantida. Acrescentado 08_Data_Protection, que não pode ficar diluído em 'políticas'.",
  },
  {
    original: "01_ACTIVE_CASES",
    v1: "01_ACTIVE_CASES/{ano}/UKTB-{ano}-{nnnn}",
    motivo: "Pasta por ano evita milhares de casos no mesmo nível e facilita arquivamento.",
  },
  {
    original: "02_COMPLETED_CASES/{ano}",
    v1: "02_COMPLETED_CASES/{ano}",
    motivo: "Mantida. Em SharePoint, prefira 'mover' via fluxo controlado; links e permissões quebram em movimentos manuais.",
  },
  {
    original: "03_REFERRALS",
    v1: "03_REGISTERS (índice de referrals)",
    motivo: "O documento original vive no caso. Aqui ficam apenas índices/relatórios, para não criar cópias divergentes.",
  },
  {
    original: "04_CERTIFICATES",
    v1: "03_REGISTERS (livro de certificados)",
    motivo: "Idem: cópia controlada no caso; o registro central é um índice com número, emissão e validade.",
  },
  {
    original: "05_LABORATORY",
    v1: "00_ADMINISTRATION/06_Laboratory + caso/06_SPUTUM_LAB",
    motivo: "Separa o contrato/acreditação (administrativo) do resultado do candidato (caso). Evita duplicidade.",
  },
  {
    original: "06_AUDIT_ARCHIVE",
    v1: "04_AUDIT_PACKS",
    motivo: "Renomeado para deixar claro que é um pacote gerado e congelado, não o arquivo corrente de auditoria.",
  },
  {
    original: "(não existia)",
    v1: "03_REGISTERS",
    motivo: "Novo. É o coração do Audit Management System: uma linha por caso, com status, prazos e retenção.",
  },
];
