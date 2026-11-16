# UK TB Screening — Digital Library + Audit Management System

Projeto de estrutura documental e de auditoria para um serviço de **pre-entry TB screening** reconhecido pelo Reino Unido.

**Status:** Etapa 1 concluída (rascunho para validação).
**Data:** 11/11/2026.

---

## O que já existe

```
UK TB Screening/
├── 00_ADMINISTRATION/
│   └── 01_Home_Office_UKVI/
│       ├── Matriz_Requisitos_Panel_Physician_v1.0.xlsx   ← abra este
│       ├── Matriz_Requisitos_Panel_Physician_v1.0.md     ← leitura/revisão
│       └── Matriz_Requisitos_Panel_Physician_v1.0.csv    ← importação/BI
├── app/                                                   ← aplicação web (Next.js + Supabase)
│   ├── src/                                               ← telas, ações e regras
│   ├── supabase/migrations/                               ← banco, RLS e Storage
│   └── README.md                                          ← instalação e operação
├── _FONTE/                                                ← geração (não é acervo)
│   ├── dados/                                             ← fonte de verdade
│   └── gerar.mjs
└── README.md
```

### Aplicação web

A pasta `app/` contém o sistema operacional da clínica: prontuário por caso, checklist
com bloqueios, upload de documentos, certificado, encaminhamento e auditoria.

- **Stack:** Next.js 15 (Vercel) + Supabase (Postgres, Auth e Storage).
- **Instalação, migrações, papéis e deploy:** veja [`app/README.md`](app/README.md).
- **Nenhum dado de paciente** deve ser colocado nesta pasta do OneDrive: o ambiente de
  produção é o projeto Supabase + Vercel da clínica.

### O que é a matriz

95 requisitos em 11 domínios, cada um com:

| Campo | Serve para |
|---|---|
| Requisito e fonte | Saber **o que** a norma pede e **onde** está |
| Obrigação | Separar exigência legal de boa prática |
| Evidência | Saber **o que** precisa existir no arquivo |
| Responsável | Saber **quem** responde |
| Local | Saber **onde** arquivar (código da estrutura) |
| Retenção | Saber **por quanto tempo** guardar |
| Teste de auditoria | Saber **como** isso será cobrado |

Domínios: governança, identificação, consentimento, triagem clínica, CXR, laboratório, certificado, encaminhamento/tratamento, auditoria/qualidade, proteção de dados e retenção.

## Como usar

1. Abra o **XLSX**. Comece pela aba `Leia-me`.
2. Na aba `Matriz`, use os filtros e a coluna **Status** (`Não iniciado → Em andamento → Implantado → Validado`) para acompanhar a implantação.
3. Leia as abas `Lacunas` e `Decisoes` antes de desenhar a estrutura definitiva. Há pontos que precisam de resposta oficial da UKHSA/UKVI.
4. A aba `Retencao` tem um alerta que não pode passar: **3 anos é o mínimo britânico, não necessariamente o prazo local**.

## Cinco achados que mudam o desenho original

1. **Retenção não é só 3 anos.** A TI fixa 3 anos, mas a lei local pode exigir mais. No Brasil, o prontuário é de 20 anos (CFM 1.821/2007). O sistema precisa calcular a data de descarte, não estimar.
2. **O certificado está migrando para o eletrônico (PETS).** Arquivar apenas um PDF gerado pela clínica não basta. É preciso conciliar o registro local com o PETS.
3. **A validade para contatos familiares mudou.** A v7 fala em 3 meses; a atualização de 2025 indica 6 meses. Isso tem de ser uma regra versionada, não um número fixo no código.
4. **O prazo de escarro é fatal.** A coleta precisa começar em até 7 dias da CXR; se passar, o processo é encerrado e reportado. Alerta preventivo é obrigatório.
5. **Cópia em dois lugares é risco.** Referrals, certificados e laboratório devem ser **índices** no nível central e **originais** dentro do caso. Duplicar documento é a forma mais rápida de perder a versão válida.

## Avisos importantes

- **Nada de dados de pacientes aqui.** Esta pasta é para documentos de projeto (matriz, SOPs, modelos). Prontuário, DICOM e certificado vivem no ambiente institucional aprovado, nunca no OneDrive pessoal.
- **A matriz não substitui a TI oficial.** A versão vigente das UKTBTI deve ser confirmada por escrito com a UKHSA. A v7 (2019) é a versão pública no GOV.UK; há uma atualização anunciada em 2025.
- **O exemplo brasileiro de retenção só vale se a clínica estiver no Brasil.** Confirme a jurisdição antes de calibrar o sistema (decisão D-01).

## Próximas etapas

| Etapa | Entrega | Depende de |
|---|---|---|
| 2 — Arquitetura | Estrutura definitiva do SharePoint/ambiente, metadados, permissões, retenção | D-01 a D-05 |
| 3 — Master Register | Lista central com validações, alertas, cálculo de retenção e dashboards | Etapa 2 |
| 4 — Prontuário eletrônico | Checklist por caso, com bloqueios das 8 regras críticas | Etapas 2 e 3 |
| 5 — Audit Pack | Pacote de auditoria em 1 clique, com índice e trilha | Etapas 3 e 4 |

## Como regenerar os arquivos

A matriz é gerada a partir de `_FONTE/dados`. Para alterar:

```powershell
cd "UK TB Screening"
node "_FONTE\gerar.mjs"
```

Requisito: Node.js 18+ e `npm install` dentro de `_FONTE` (só para o XLSX).

## Fontes principais

- [UK Tuberculosis Technical Instructions v7 (2019)](https://www.gov.uk/government/publications/uk-tuberculosis-technical-instructions)
- [Tuberculosis screening — UKHSA (atualizado em 10/03/2026)](https://www.gov.uk/guidance/tuberculosis-screening)
- [TB tests for visa applicants — GOV.UK](https://www.gov.uk/tb-test-visa)
- [UK Technical Instructions update 2025 — UKHSA](https://panelphysician.org/file/06b39d72-f9e6-49ff-912e-e74b5b435f35/K2%20United%20Kingdom%20Technical%20Instructions%20%28Repeat%20A3%29.pdf)
- [Complete UK pre-entry health screening — avaliação do serviço (10/2026)](https://digitalhealth.blog.gov.uk/2026/10/14/ukhsa-complete-uk-pre-entry-health-screening-beta-reassessment/)
- [PETS — repositório público da UKHSA](https://github.com/UKHSA-Internal/pre-entry-tb-screening-app)
