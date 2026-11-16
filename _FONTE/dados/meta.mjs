// Fonte única de verdade — metadados do documento.
// Editar aqui e rodar: node _FONTE/gerar.mjs

export const meta = {
  titulo: "Matriz de Requisitos do Panel Physician",
  subtitulo: "UK Pre-Entry TB Screening — base para a Digital Library + Audit Management System",
  versao: "1.0",
  data: "2026-11-11",
  autor: "Equipe do projeto — UK TB Screening Digital Library",
  status: "RASCUNHO PARA VALIDAÇÃO",
  aviso:
    "Documento de trabalho. Não substitui as Technical Instructions oficiais nem parecer jurídico. " +
    "A versão vigente das UKTBTI deve ser confirmada por escrito com a UKHSA/UKVI antes da implantação.",
  resumo:
    "{total} requisitos em {dominios} domínios, extraídos da versão 7 das UKTBTI (2019), da atualização UK 2025 " +
    "(UKHSA) e do sistema oficial PETS. Cada linha indica o que guardar, quem responde, onde arquivar, " +
    "por quanto tempo e como o auditor vai testar.",
};

export const dominios = [
  { id: "GOV", nome: "Governança, credenciamento e obrigações institucionais", curto: "Governança" },
  { id: "ID", nome: "Identificação, supervisão e rastreabilidade do candidato", curto: "Identificação" },
  { id: "CON", nome: "Informação e consentimento", curto: "Consentimento" },
  { id: "CLI", nome: "Triagem clínica e elegibilidade", curto: "Triagem clínica" },
  { id: "CXR", nome: "Radiografia de tórax", curto: "CXR" },
  { id: "LAB", nome: "Escarro e laboratório", curto: "Laboratório" },
  { id: "CERT", nome: "Desfecho e certificado de liberação", curto: "Certificado" },
  { id: "REF", nome: "Encaminhamento, tratamento e notificações", curto: "Encaminhamento" },
  { id: "AUD", nome: "Auditoria, qualidade e melhoria", curto: "Auditoria" },
  { id: "DAD", nome: "Proteção de dados e segurança da informação", curto: "Dados" },
  { id: "RET", nome: "Retenção, disponibilização e descarte", curto: "Retenção" },
];

export const obrigacoes = ["Obrigatório", "Condicional", "Recomendado"];

// Regras de retenção usadas na coluna "Retenção".
export const retencaoRegras = [
  {
    codigo: "Caso — 3 anos (UK)",
    regra:
      "Mínimo legal britânico: 3 anos (UKTBTI, Anexo B e §4). Contar a partir da data da CXR/avaliação inicial; " +
      "se houver tratamento, a partir do desfecho. Pode ser ampliado por lei local (ver RET-03).",
    exemplos: "CXR original/DICOM, laudo, consentimento, medical record, resultados de escarro, referral, tratamento.",
  },
  {
    codigo: "Permanente",
    regra: "Documento de governança que precisa sobreviver à troca de gestão, para demonstrar conformidade histórica.",
    exemplos: "Designação UK, versões das TI, SOPs (vigente + superadas), política de retenção.",
  },
  {
    codigo: "Vigência + 6 anos",
    regra: "Enquanto o contrato/apólice estiver vigente e por 6 anos após o término, para cobrir auditoria e litígio.",
    exemplos: "Seguro profissional, contratos com laboratório/radiologia, tabela de preços.",
  },
  {
    codigo: "Vínculo + 3 anos",
    regra: "Enquanto o profissional estiver ativo e por 3 anos após o desligamento.",
    exemplos: "Registro profissional, treinamentos, matriz de competência.",
  },
  {
    codigo: "6 anos",
    regra: "Registros de Assurance: auditorias, incidentes, CAPA, reclamações.",
    exemplos: "Relatórios de auditoria, plano de ação, evidência de fechamento.",
  },
  {
    codigo: "Caso + 6 anos",
    regra: "Acompanha o caso, com 6 anos adicionais para logs e trilhas de acesso/divulgação.",
    exemplos: "Log de verificação de identidade, registro de divulgações, trilha de emissão de certificado.",
  },
];

export const prazos = [
  { prazo: "10 dias úteis", o_que: "Agendar a triagem do candidato (preferencialmente em poucos dias).", fonte: "TI v7 §3" },
  { prazo: "Antes da triagem", o_que: "Consentimento informado assinado e explicado.", fonte: "TI v7 §4" },
  { prazo: "1 dia", o_que: "Laudo radiológico disponível após a CXR.", fonte: "TI v7 §6" },
  { prazo: "7 dias", o_que: "Início da coleta de escarro após a CXR; se não, o processo para e é reportado.", fonte: "TI v7 §7" },
  { prazo: "≥ 24 horas", o_que: "Intervalo mínimo entre as 3 amostras de escarro.", fonte: "TI v7 §7" },
  { prazo: "1 hora / 4 horas", o_que: "Refrigerar se não transportar em 1h; chegada ao laboratório em até 4h.", fonte: "TI v7 Anexo E" },
  { prazo: "24 horas", o_que: "Processamento da amostra após o recebimento no laboratório.", fonte: "TI v7 §7" },
  { prazo: "6 / 8 semanas", o_que: "Cultura mínima em meio líquido / sólido, salvo positivo antes.", fonte: "TI v7 §7" },
  { prazo: "10 semanas", o_que: "Laudo final de cultura e resultado de DST, no máximo.", fonte: "TI v7 §7" },
  { prazo: "3 meses", o_que: "Repetição da CXR quando não há laboratório acreditado ou não há produção de escarro.", fonte: "TI v7 §6 e §7" },
  { prazo: "6 meses", o_que: "Validade do certificado a partir da CXR/avaliação inicial.", fonte: "TI v7 §9" },
  { prazo: "3 meses", o_que: "Validade reduzida para contatos familiares negativos (regra da v7; revisar na versão vigente).", fonte: "TI v7 §9; update 2025" },
  { prazo: "6 meses", o_que: "Intervalo mínimo para re-triagem após tratamento completo.", fonte: "TI v7 §8" },
  { prazo: "3 anos", o_que: "Retenção mínima dos registros do caso.", fonte: "TI v7 Anexo B" },
];
