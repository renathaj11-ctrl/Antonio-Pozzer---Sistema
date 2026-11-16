# Matriz de Requisitos do Panel Physician

**UK Pre-Entry TB Screening — base para a Digital Library + Audit Management System**

| | |
|---|---|
| Versão | 1.0 |
| Data | 11/11/2026 |
| Status | **RASCUNHO PARA VALIDAÇÃO** |
| Autor | Equipe do projeto — UK TB Screening Digital Library |

> **Aviso.** Documento de trabalho. Não substitui as Technical Instructions oficiais nem parecer jurídico. A versão vigente das UKTBTI deve ser confirmada por escrito com a UKHSA/UKVI antes da implantação.

95 requisitos em 11 domínios, extraídos da versão 7 das UKTBTI (2019), da atualização UK 2025 (UKHSA) e do sistema oficial PETS. Cada linha indica o que guardar, quem responde, onde arquivar, por quanto tempo e como o auditor vai testar.

---

## 1. Para que serve esta matriz

Esta é a Etapa 1 do projeto: transformar as exigências britânicas em uma lista verificável, antes de desenhar pastas, planilhas ou fluxos. Cada linha responde a cinco perguntas:

1. **O que** a norma exige (e de onde vem).
2. **Qual evidência** prova que foi feito.
3. **Quem** responde.
4. **Onde** o documento é arquivado.
5. **Como** um auditor testa isso — e por **quanto tempo** o registro fica retido.

A coluna **Local** usa os códigos da estrutura da seção 5. A coluna **SOP** aponta para o procedimento que deve governar a execução. A matriz não substitui a TI oficial nem parecer jurídico: ela organiza a obrigação para que nada se perca entre a norma e a prática.

## 2. Escopo e limites

**Incluído:** requisitos do programa de pré-entrada no Reino Unido, do registro do candidato ao certificado, incluindo laboratório, encaminhamento, auditoria, dados e retenção.

**Não incluído (ainda):** desenho técnico do SharePoint, modelo de dados definitivo, textos finais das SOPs, treinamento da equipe e migração de acervo existente. Isso é Etapa 2 em diante.

**Importante:** a matriz foi construída sobre a **versão 7 das UKTBTI (2019)**, que é a versão pública no GOV.UK, e sinaliza as mudanças anunciadas na **atualização de 2025** (nova TI, PETS e certificado eletrônico). A versão vigente deve ser confirmada por escrito com a UKHSA antes da implantação. Ver L-01.

## 3. Números

| Indicador | Valor |
|---|---|
| Requisitos mapeados | **95** |
| Domínios | **11** |
| Obrigatórios | **73** |
| Condicionais | **15** |
| Recomendados (boa prática) | **7** |
| Com teste de auditoria definido | **95** |

| Domínio | Requisitos |
|---|---|
| GOV — Governança, credenciamento e obrigações institucionais | 8 |
| ID — Identificação, supervisão e rastreabilidade do candidato | 7 |
| CON — Informação e consentimento | 8 |
| CLI — Triagem clínica e elegibilidade | 9 |
| CXR — Radiografia de tórax | 14 |
| LAB — Escarro e laboratório | 13 |
| CERT — Desfecho e certificado de liberação | 9 |
| REF — Encaminhamento, tratamento e notificações | 7 |
| AUD — Auditoria, qualidade e melhoria | 7 |
| DAD — Proteção de dados e segurança da informação | 8 |
| RET — Retenção, disponibilização e descarte | 5 |

## 4. Como ler a matriz

- **Obrigatório** — exigência direta da TI ou de lei aplicável.
- **Condicional** — exigível apenas em determinada situação (gestante, menor, CXR anormal, tratamento etc.).
- **Recomendado** — boa prática de desenho do sistema; não é exigência literal da TI, mas fecha lacunas de prova.
- **Fonte** — onde a exigência está. "TI v7" remete às Technical Instructions; "Desenho" indica decisão nossa.
- **Retenção** — usa os códigos da seção 8. O mínimo britânico é **3 anos**, mas a lei local pode exigir mais.

> **Leia com o XLSX ao lado.** A versão Markdown é para leitura e revisão; a planilha tem filtros, validação de status e as abas de prazos, retenção, lacunas e decisões.

## 5. Estrutura de arquivo proposta (v1.0)

A estrutura abaixo é a tradução da matriz em pastas. Ela ainda será validada na Etapa 2, mas já permite responder às perguntas de auditoria.

| Código | Caminho | O que guarda |
|---|---|---|
| `ADM/01_UKVI` | `00_ADMINISTRATION/01_Home_Office_UKVI` | Designação, condições, versões das TI, tabela de preços, correspondência com UKVI/UKHSA. |
| `ADM/02_SOPs` | `00_ADMINISTRATION/02_Policies_SOPs` | SOPs controladas, políticas, formulários-modelo e histórico de versões. |
| `ADM/03_Training` | `00_ADMINISTRATION/03_Staff_Training` | Registro profissional, matriz de competência, treinamentos e reciclagens. |
| `ADM/04_QA` | `00_ADMINISTRATION/04_Quality_Assurance` | Indicadores, incidentes, CAPA, reclamações, biossegurança e ventilação. |
| `ADM/05_Equipment` | `00_ADMINISTRATION/05_Equipment` | Equipamento de raio-X, manutenção, calibração, dosimetria e protocolos técnicos. |
| `ADM/06_Lab` | `00_ADMINISTRATION/06_Laboratory` | Contratos, acreditação, DPA, SLA e QA do laboratório e da radiologia. |
| `ADM/07_Audit` | `00_ADMINISTRATION/07_Audit` | Plano de auditoria, relatórios, respostas a auditorias externas e pacotes. |
| `ADM/08_DPO` | `00_ADMINISTRATION/08_Data_Protection` | Política de privacidade, ROPA, acessos, incidentes de dados e retenção. |
| `ACT` | `01_ACTIVE_CASES/{ano}/UKTB-{ano}-{nnnn}` | Casos em andamento, por ano de abertura. O ID é imutável e nunca reutilizado. |
| `COMP` | `02_COMPLETED_CASES/{ano}/UKTB-{ano}-{nnnn}` | Casos encerrados, mesma estrutura interna do caso ativo. |
| `CASO/00_CONTROLE` | `.../00_CASE_CONTROL` | Checklist de completude, status, categoria, retenção, prazos e trilha do caso. |
| `CASO/01_IDENTIDADE` | `.../01_IDENTITY` | Passaporte, verificações por estágio, documento alternativo, acompanhante. |
| `CASO/02_CONSENTIMENTO` | `.../02_CONSENT` | Consentimento assinado, tradução, aconselhamento de gestante, retirada. |
| `CASO/03_PRONTUARIO` | `.../03_MEDICAL_RECORD` | Anexo G, sintomas, contato, exame físico, decisão clínica do PP. |
| `CASO/04_CXR` | `.../04_CHEST_XRAY` | DICOM original, cópia de visualização, hash, registro de repetição. |
| `CASO/05_LAUDO` | `.../05_RADIOLOGY_REPORT` | Laudo codificado (Anexo D), comparação com CXR anterior, revisão do PP. |
| `CASO/06_ESCARRO` | `.../06_SPUTUM_LAB` | Decisão, coletas, cadeia de custódia, laudo, DST, tentativas alternativas. |
| `CASO/07_ENCAMINHAMENTO` | `.../07_REFERRAL` | Carta Anexo H, aconselhamento, comunicação de positivos. |
| `CASO/08_TRATAMENTO` | `.../08_TREATMENT` | Plano, prescrições, adesão, desfecho, relatório e re-triagem. |
| `CASO/09_CERTIFICADO` | `.../09_TB_CERTIFICATE` | Certificado emitido/não emitido, número, validade, versões e log do PETS. |
| `CASO/10_CORRESPONDENCIA` | `.../10_CORRESPONDENCE` | Leaflet, recibos de entrega, comunicações com o candidato. |
| `CASO/11_DIVULGACOES` | `.../11_DISCLOSURES` | Notificações e compartilhamentos: quem, quando, para quem, base legal. |
| `REG` | `03_REGISTERS` | Master Register e índices: casos, certificados, escarro, referrals, retenção. |
| `AUDIT_PACKS` | `04_AUDIT_PACKS` | Pacotes congelados para auditoria externa, com índice e data de geração. |

### 5.1 Ajustes à estrutura original

| Estrutura original | Estrutura v1.0 | Motivo |
|---|---|---|
| 00_ADMINISTRATION | 00_ADMINISTRATION | Mantida. Acrescentado 08_Data_Protection, que não pode ficar diluído em 'políticas'. |
| 01_ACTIVE_CASES | 01_ACTIVE_CASES/{ano}/UKTB-{ano}-{nnnn} | Pasta por ano evita milhares de casos no mesmo nível e facilita arquivamento. |
| 02_COMPLETED_CASES/{ano} | 02_COMPLETED_CASES/{ano} | Mantida. Em SharePoint, prefira 'mover' via fluxo controlado; links e permissões quebram em movimentos manuais. |
| 03_REFERRALS | 03_REGISTERS (índice de referrals) | O documento original vive no caso. Aqui ficam apenas índices/relatórios, para não criar cópias divergentes. |
| 04_CERTIFICATES | 03_REGISTERS (livro de certificados) | Idem: cópia controlada no caso; o registro central é um índice com número, emissão e validade. |
| 05_LABORATORY | 00_ADMINISTRATION/06_Laboratory + caso/06_SPUTUM_LAB | Separa o contrato/acreditação (administrativo) do resultado do candidato (caso). Evita duplicidade. |
| 06_AUDIT_ARCHIVE | 04_AUDIT_PACKS | Renomeado para deixar claro que é um pacote gerado e congelado, não o arquivo corrente de auditoria. |
| (não existia) | 03_REGISTERS | Novo. É o coração do Audit Management System: uma linha por caso, com status, prazos e retenção. |

**A regra de ouro:** cada documento tem **um único original**. As pastas transversais (referrals, certificados, laboratório) guardam **índices**, não cópias. Cópia em dois lugares é a forma mais rápida de perder a versão válida.

## 6. Matriz de requisitos

### GOV — Governança, credenciamento e obrigações institucionais

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **GOV-01** | Manter evidência da designação da clínica e do Panel Physician pelas autoridades britânicas, alinhada à lista oficial de clínicas aprovadas. | TI v7 (Role of the Panel Physician); Anexo B; GOV.UK — approved TB test clinics | Obrigatório | Carta/termo de designação, dados da clínica, comprovante de listagem oficial | Panel Physician / Responsável legal | `ADM/01_UKVI` | Permanente | SOP-001 | Confrontar a designação arquivada com a lista pública do GOV.UK e com a vigência. |
| **GOV-02** | Comprovar registro profissional pleno e vigente de todos os médicos que atuam no programa, conforme a lei do país. | TI v7 Anexo B | Obrigatório | Diploma, registro no conselho, certidão de regularidade, CV | Panel Physician / RH | `ADM/03_Training` | Vínculo + 3 anos | SOP-014 | Conferir se o registro estava vigente na data de cada caso amostrado. |
| **GOV-03** | Manter seguro/indemnização profissional abrangendo todo o processo de triagem. | TI v7 Anexo B | Obrigatório | Apólice vigente, certificado, descrição da cobertura | Responsável legal / Administrativo | `ADM/01_UKVI` | Vigência + 6 anos | SOP-001 | Verificar vigência e cobertura para triagem TB e atos de terceiros. |
| **GOV-04** | Cumprir as condições acordadas com as autoridades britânicas e usar sempre a versão mais atual das Technical Instructions. | TI v7 Anexo B | Obrigatório | Termo de condições; registro da versão da TI em uso; ata de revisão e análise de impacto | Panel Physician | `ADM/01_UKVI` | Permanente | SOP-017 | Comparar a versão arquivada com a vigente no GOV.UK/UKHSA e verificar análise de impacto. |
| **GOV-05** | Participar de auditorias e fornecer dados de monitoramento, incluindo resultados e dados pessoais para identificação e contato no Reino Unido. | TI v7 Anexo B | Obrigatório | Solicitações recebidas, extratos enviados, protocolo de resposta, comprovante de envio | Panel Physician / Auditor interno | `ADM/07_Audit` | 6 anos | SOP-012 | Simular um pedido de auditoria e medir o tempo de produção do pacote. |
| **GOV-06** | Praticar preço uniforme entre candidatos, comunicar às autoridades britânicas o valor cobrado e informar variações. | TI v7 Anexo B (Costs) | Obrigatório | Tabela de preços, comunicação às autoridades, histórico de alterações | Administrativo / Responsável legal | `ADM/01_UKVI` | Vigência + 6 anos | SOP-018 | Comparar valores cobrados em casos do mesmo período e verificar a comunicação. |
| **GOV-07** | Responder por todos os processos executados por terceiros (laboratório, radiologia, transporte), mantendo supervisão e evidência. | TI v7 Anexo B; §7 | Obrigatório | Contratos, DPA, SLA, evidência de supervisão, relatórios de QA do terceiro | Panel Physician | `ADM/06_Lab` | Vigência + 6 anos | SOP-007 | Verificar se o contrato cobre escopo, prazos, qualidade, confidencialidade e direito de auditoria. |
| **GOV-08** | Manter evidência de designação do radiologista e de acreditação/designação do laboratório de TB. | TI v7 §6; §7 | Obrigatório | Credenciais do radiologista, certificado de acreditação do laboratório, carta de designação | Panel Physician / Radiologista | `ADM/06_Lab` | Vigência + 6 anos | SOP-007 | Confrontar a acreditação com a lista de laboratórios designados (UK, IOM ou parceiros) na data da coleta. |

**Notas do domínio**

- **GOV-01** — Perda ou renovação da designação deve disparar revisão imediata do sistema documental.
- **GOV-04** — Ponto crítico 2025/2026: há atualização das TI, migração para PETS e certificado eletrônico. Confirmar a versão aplicável por escrito.
- **GOV-05** — É a base do Audit Dashboard e do Audit Pack.
- **GOV-06** — Cobrança de escarro pode ser adicional, mas deve seguir o padrão local e o teto definido pelas autoridades.
- **GOV-07** — A delegação não transfere a responsabilidade do Panel Physician.
- **GOV-08** — Sem laboratório acreditado, aplica-se o fluxo de CXR repetida em 3 meses.

### ID — Identificação, supervisão e rastreabilidade do candidato

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **ID-01** | Verificar e supervisionar a identidade do candidato em cinco pontos: registro, exame médico, CXR, coleta de escarro e emissão de certificado/encaminhamento. | TI v7 §5 (Security) | Obrigatório | Checklist/registro de verificação por estágio (data, hora, responsável, documento) | Administrativo / Enfermeiro / Radiógrafo / Panel Physician | `CASO/01_IDENTIDADE` | Caso — 3 anos (UK) | SOP-002 | Escolher um caso completo e exigir os 5 registros com assinatura do responsável. |
| **ID-02** | Exigir passaporte válido ou, excepcionalmente, documento fotográfico alternativo previamente aprovado; conferir validade, data de nascimento, foto, titularidade e assinatura. | TI v7 §5 | Obrigatório | Cópia da página de dados do passaporte; termo de aprovação de documento alternativo | Administrativo | `CASO/01_IDENTIDADE` | Caso — 3 anos (UK) | SOP-002 | Comparar nome/DOB do passaporte com prontuário, CXR e certificado. |
| **ID-03** | Registrar quem verificou a identidade, quando e qual documento foi apresentado, em cada estágio. | Desenho do sistema (boa prática) | Recomendado | Log de verificação de identidade | Administrativo / Enfermeiro | `CASO/01_IDENTIDADE` | Caso + 6 anos | SOP-002 | Verificar se há pelo menos 5 verificações em um caso completo. |
| **ID-04** | Em caso de dúvida sobre a identidade, solicitar documentos adicionais e/ou consultar a autoridade de imigração, registrando a decisão. | TI v7 §5 | Condicional | Registro da dúvida, documentos adicionais, correspondência | Panel Physician | `CASO/01_IDENTIDADE` | Caso — 3 anos (UK) | SOP-002 | Verificar caso com exceção de identidade e a resposta da autoridade. |
| **ID-05** | Garantir supervisão por equipe competente em todos os estágios; menores de 17 anos acompanhados por responsável; famílias triadas juntas. | TI v7 §3; §5 | Obrigatório | Escala de supervisão, registro do acompanhante, agendamento familiar | Administrativo / Panel Physician | `CASO/00_CONTROLE` | Caso — 3 anos (UK) | SOP-002 | Verificar caso de menor com identificação e assinatura do acompanhante. |
| **ID-06** | Identificar amostras com rótulo não removível e à prova de adulteração, vinculando-as ao candidato. | TI v7 §5; Anexo E | Obrigatório | Registro/foto do rótulo, cadeia de custódia | Enfermeiro / Laboratório | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-006 | Rastrear uma amostra do caso até o laudo do laboratório. |
| **ID-07** | Usar um UKTB ID imutável como identificador operacional e manter nome, DOB e passaporte apenas no cadastro controlado. | Desenho do sistema (boa prática) | Recomendado | Master Register, política de nomenclatura de arquivos | Administrativo / DPO | `REG` | Permanente | SOP-010 | Verificar se nomes de arquivo não expõem dados pessoais e se o ID é único e não reutilizado. |

**Notas do domínio**

- **ID-01** — No PETS, a foto do candidato e os dados do passaporte reforçam a conferência; não substituem o registro local.
- **ID-03** — A TI exige a verificação; o log estruturado é o que a torna auditável.
- **ID-07** — Duas camadas: identificador operacional (UKTB-AAAA-NNNN) e identificação do paciente no cadastro.

### CON — Informação e consentimento

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **CON-01** | Obter consentimento informado assinado antes do início da triagem, no formulário do Anexo F e em idioma compreensível. | TI v7 §4; Anexo F | Obrigatório | Formulário assinado e datado (PDF), versão do formulário, tradução quando aplicável | Panel Physician / Administrativo | `CASO/02_CONSENTIMENTO` | Caso — 3 anos (UK) | SOP-003 | Verificar assinatura, data anterior à CXR e idioma compatível com o candidato. |
| **CON-02** | Explicar processo, riscos, benefícios e alternativas por profissional qualificado, sob supervisão do PP, com tempo para perguntas. | TI v7 §4 | Obrigatório | Nome e função de quem explicou; declaração do intérprete; registro de dúvidas | Panel Physician / Administrativo | `CASO/02_CONSENTIMENTO` | Caso — 3 anos (UK) | SOP-003 | Conferir identificação do responsável pela explicação e, se houve, do intérprete. |
| **CON-03** | Colher assinatura de pai/guardião para menores ou pessoas sem capacidade e testemunha independente quando o candidato não puder assinar. | TI v7 §4; Anexo F | Condicional | Assinatura do responsável, relação com o candidato, testemunha independente | Panel Physician | `CASO/02_CONSENTIMENTO` | Caso — 3 anos (UK) | SOP-003 | Verificar caso de menor/incapaz e a qualidade de quem assinou. |
| **CON-04** | Informar e registrar a autorização de compartilhamento com UKVI, Departamento de Saúde, UKHSA/PHE, NHS e autoridades locais quando exigido. | TI v7 §4; Anexo F | Obrigatório | Cláusula assinada; registro de divulgações | Panel Physician / DPO | `CASO/02_CONSENTIMENTO` | Caso — 3 anos (UK) | SOP-010 | Verificar se cada divulgação tem base no consentimento e registro. |
| **CON-05** | Registrar a retirada de consentimento a qualquer momento e não emitir certificado nesse caso. | TI v7 §4; §8 | Condicional | Termo de retirada, registro de status e motivo | Panel Physician / Administrativo | `CASO/00_CONTROLE` | Caso — 3 anos (UK) | SOP-003 | Verificar se o status e o motivo estão registrados e se não houve certificado. |
| **CON-06** | Para gestantes, aconselhar sobre risco radiológico e registrar a opção escolhida: adiar, 3 escarros ou CXR no 2º/3º trimestre com dupla proteção. | TI v7 §3; §4; Anexo F | Condicional | Registro de aconselhamento, opção escolhida, consentimento específico, DUM | Panel Physician | `CASO/02_CONSENTIMENTO` | Caso — 3 anos (UK) | SOP-003 | Verificar registro da DUM, das opções oferecidas e da decisão. |
| **CON-07** | Manter o consentimento por 3 anos e disponibilizá-lo às autoridades quando solicitado. | TI v7 §4 | Obrigatório | Formulário arquivado, controle de retenção | Administrativo | `CASO/02_CONSENTIMENTO` | Caso — 3 anos (UK) | SOP-011 | Selecionar caso de 2 anos e localizar o consentimento. |
| **CON-08** | Informar propósito, natureza e extensão da triagem no acolhimento, com material informativo. | TI v7 §3 (General arrangements) | Obrigatório | Versão do leaflet, registro de entrega | Administrativo | `CASO/10_CORRESPONDENCIA` | Caso — 3 anos (UK) | SOP-003 | Verificar se o candidato recebeu o material antes da triagem. |

**Notas do domínio**

- **CON-01** — O consentimento é válido apenas se assinado após explicação suficiente.
- **CON-02** — A TI exige que o formulário seja explicado por profissional qualificado e supervisionado pelo PP.
- **CON-05** — PETS: motivo 'visa applicant has withdrawn their TB screening'.
- **CON-06** — A TI não recomenda CXR no primeiro trimestre.
- **CON-08** — Pode ser inicialmente por leaflet, conforme a TI.

### CLI — Triagem clínica e elegibilidade

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **CLI-01** | Realizar triagem padronizada de sintomas (tosse, hemoptise, perda de peso, sudorese noturna, febre) e história prévia de TB nos últimos 3 meses. | TI v7 §3; Anexo G | Obrigatório | Formulário de triagem (Anexo G) preenchido e assinado | Panel Physician | `CASO/03_PRONTUARIO` | Caso — 3 anos (UK) | SOP-001 | Conferir todos os campos e a assinatura do médico. |
| **CLI-02** | Pesquisar contato com caso de TB pulmonar ativa (mesmo ambiente por dias ou semanas) e histórico domiciliar nos últimos 2 anos. | TI v7 §3; Anexo G | Obrigatório | Respostas e detalhes do contato | Panel Physician | `CASO/03_PRONTUARIO` | Caso — 3 anos (UK) | SOP-001 | Verificar se contato positivo gerou conduta registrada. |
| **CLI-03** | Realizar exame físico quando clinicamente indicado e registrar os achados. | TI v7 §3; Anexo G | Condicional | Notas do exame físico, assinatura e data | Panel Physician | `CASO/03_PRONTUARIO` | Caso — 3 anos (UK) | SOP-001 | Verificar se a ausência de exame está justificada. |
| **CLI-04** | Para menores de 11 anos, aplicar triagem específica (febre, doença respiratória crônica, cirurgia torácica, cianose, insuficiência respiratória) e exame físico obrigatório. | TI v7 §3 | Obrigatório | Formulário infantil, exame físico | Panel Physician | `CASO/03_PRONTUARIO` | Caso — 3 anos (UK) | SOP-001 | Verificar se o caso de menor usou o formulário e o fluxo corretos. |
| **CLI-05** | Para gestantes, pesquisar contato no último ano e verificar a possibilidade de reutilizar CXR de clínica aprovada realizada nos últimos 3 meses. | TI v7 §3 | Condicional | Registro de contato; CXR anterior com origem aprovada | Panel Physician | `CASO/03_PRONTUARIO` | Caso — 3 anos (UK) | SOP-004 | Verificar a origem da CXR anterior e a ausência de sintomas/contato no intervalo. |
| **CLI-06** | Classificar o candidato em adulto, gestante ou menor de 11 anos e aplicar o fluxo e os campos obrigatórios correspondentes. | Desenho do sistema (boa prática) | Recomendado | Categoria no caso; checklist aplicado | Administrativo / Panel Physician | `CASO/00_CONTROLE` | Caso — 3 anos (UK) | SOP-001 | Verificar se o checklist aplicado corresponde à categoria. |
| **CLI-07** | Registrar a decisão clínica do PP, inclusive suspeita clínica que exige escarro com CXR normal e recusa de certificado por suspeita. | TI v7 Anexo A (notas 1–3); §8 | Obrigatório | Justificativa clínica, conduta e assinatura | Panel Physician | `CASO/03_PRONTUARIO` | Caso — 3 anos (UK) | SOP-005 | Verificar casos com CXR normal e escarro solicitado: existe justificativa? |
| **CLI-08** | Garantir agendamento em até 10 dias úteis, preferencialmente em poucos dias. | TI v7 §3 | Obrigatório | Data da solicitação, data do agendamento, indicador de prazo | Administrativo | `REG` | 6 anos | SOP-001 | Calcular tempo médio e máximo de espera por mês. |
| **CLI-09** | Não aceitar IGRA/Mantoux, outros testes ou BCG como alternativa à CXR; registrar se o candidato solicitou. | TI v7 §3 | Obrigatório | Registro de orientação/recusa | Panel Physician | `CASO/03_PRONTUARIO` | Caso — 3 anos (UK) | SOP-001 | Verificar se houve teste alternativo registrado e como foi tratado. |

**Notas do domínio**

- **CLI-01** — PETS: symptomsOfTb, symptoms[], historyOfPreviousTb.
- **CLI-02** — PETS: contactWithPersonWithTb, contactWithTbDetails.
- **CLI-03** — PETS: physicalExaminationNotes.
- **CLI-04** — PETS: historyOfConditionsUnder11[]; CXR PA + lateral.
- **CLI-05** — CXR de clínica não aprovada não pode ser usada.
- **CLI-06** — A categoria deve ser derivada de idade/gestação, não escolhida manualmente.
- **CLI-07** — O julgamento clínico do PP prevalece sobre o resultado isolado.
- **CLI-08** — Indicador operacional do dashboard.
- **CLI-09** — Exceções previstas: gestante, criança e incapacidade para CXR — sempre com escarro.

### CXR — Radiografia de tórax

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **CXR-01** | Realizar CXR em incidência PA para maiores de 11 anos e PA + lateral para menores de 11. | TI v7 §6; Anexo C | Obrigatório | DICOM com as incidências; laudo | Radiógrafo | `CASO/04_CXR` | Caso — 3 anos (UK) | SOP-004 | Verificar as incidências por faixa etária. |
| **CXR-02** | Adquirir conforme parâmetros técnicos: T1–T4 visíveis, inspiração plena, clavículas simétricas, escápulas fora dos campos, centro em T5/T6, 150 cm, ápices e ângulos costofrênicos incluídos. | TI v7 Anexo C | Obrigatório | Protocolo de aquisição; controle de qualidade da imagem | Radiógrafo / Radiologista | `ADM/05_Equipment` | Permanente | SOP-004 | Avaliar uma amostra de imagens contra a lista técnica. |
| **CXR-03** | Garantir identificação não removível na imagem: nome em inglês, DOB/ID único, data, incidência, clínica e passaporte, em calendário gregoriano. | TI v7 §6; Anexo C | Obrigatório | DICOM com anotação burned-in; conferência no laudo | Radiógrafo | `CASO/04_CXR` | Caso — 3 anos (UK) | SOP-004 | Abrir a imagem e conferir identificação, data e lado. |
| **CXR-04** | Comparar com CXR anterior do candidato (mesma clínica ou parceiro internacional) quando disponível. | TI v7 §6 | Condicional | Laudo comparativo com referência à CXR anterior | Radiologista | `CASO/05_LAUDO` | Caso — 3 anos (UK) | SOP-005 | Verificar se havia CXR anterior e se foi considerada. |
| **CXR-05** | Rejeitar e repetir CXR subótima (penetração, movimento) antes da saída do candidato; não liberar até o radiologista aprovar. | TI v7 §6 | Obrigatório | Registro de repetição e aprovação do radiologista | Radiologista / Radiógrafo | `CASO/04_CXR` | Caso — 3 anos (UK) | SOP-004 | Verificar se há imagens repetidas e o motivo registrado. |
| **CXR-06** | Laudar em até 1 dia da realização, com nome do radiologista, data e local, descrevendo todas as anormalidades. | TI v7 §6; Anexo D | Obrigatório | Laudo assinado com timestamp | Radiologista | `CASO/05_LAUDO` | Caso — 3 anos (UK) | SOP-005 | Comparar data da CXR e data do laudo (≤ 1 dia). |
| **CXR-07** | Codificar os achados conforme o Anexo D (1.1 a 4.7), incluindo achados menores, associados e sugestivos de TB ativa. | TI v7 Anexo D | Obrigatório | Laudo com códigos numéricos | Radiologista | `CASO/05_LAUDO` | Caso — 3 anos (UK) | SOP-005 | Conferir a correspondência entre descrição e código. |
| **CXR-08** | Revisar imagem e laudo pelo PP, correlacionando com história e exame, e registrar concordância ou discordância. | TI v7 §6 | Obrigatório | Campo de revisão do PP com assinatura | Panel Physician | `CASO/05_LAUDO` | Caso — 3 anos (UK) | SOP-005 | Verificar se todos os casos têm revisão do PP antes do certificado. |
| **CXR-09** | Aplicar proteção radiológica: avental, dupla proteção para crianças e gestantes, colimação, tamanho de filme e privacidade. | TI v7 Anexo C | Obrigatório | Protocolo, registro de treinamento, checklist de sala | Radiógrafo / Responsável técnico | `ADM/05_Equipment` | Permanente | SOP-015 | Inspecionar sala e conferir registros de treinamento. |
| **CXR-10** | Manter equipamento com manutenção, calibração e QA documentados, incluindo dosimetria e controle de qualidade de imagem. | TI v7 Anexo C | Obrigatório | Contratos, certificados, relatórios de manutenção, dosimetria | Responsável técnico / Administrativo | `ADM/05_Equipment` | Vigência + 6 anos | SOP-015 | Verificar manutenção e calibração vigentes na data do caso. |
| **CXR-11** | Arquivar o DICOM original, uma cópia de visualização e o laudo, com hash de integridade e armazenamento imutável. | TI v7 Anexo B (original CXR); desenho do sistema | Obrigatório | DICOM, PDF/JPEG, hash SHA-256, registro de armazenamento | Radiologista / TI | `CASO/04_CXR` | Caso — 3 anos (UK) | SOP-016 | Verificar hash, abertura do DICOM e vínculo com o caso. |
| **CXR-12** | Se a CXR for compatível com TB ativa ou antiga, não emitir certificado e seguir para escarro; se o achado for não-TB, pode certificar com anotação de CXR anormal e escarro não realizado. | TI v7 §6; §8 | Obrigatório | Laudo, decisão do PP e anotação no certificado | Panel Physician | `CASO/05_LAUDO` | Caso — 3 anos (UK) | SOP-005 | Verificar todos os casos com código 3.x/4.x e a conduta adotada. |
| **CXR-13** | Sem acesso a laboratório acreditado, repetir a CXR após 3 meses e só certificar se não houver progressão. | TI v7 §6 | Condicional | Duas CXRs, laudo comparativo e decisão | Panel Physician | `CASO/04_CXR` | Caso — 3 anos (UK) | SOP-005 | Verificar o intervalo entre as CXRs e a comparação. |
| **CXR-14** | Quando a CXR for anormal, entregar ao candidato cópia da CXR, laudo, medical record e carta de encaminhamento. | TI v7 Anexo B | Obrigatório | Recibo de entrega e cópia do pacote | Administrativo | `CASO/10_CORRESPONDENCIA` | Caso — 3 anos (UK) | SOP-005 | Verificar recibo em caso com CXR anormal. |

**Notas do domínio**

- **CXR-03** — O passaporte deve constar na identificação da imagem.
- **CXR-06** — Indicador de SLA do laboratório de imagem.
- **CXR-07** — A codificação é o que permite triagem automática e relatórios gerenciais.
- **CXR-11** — Em radiologia digital, 'original' = DICOM como adquirido. JPEG não substitui. O PETS já armazena imagem em S3 com verificação antimalware.
- **CXR-12** — Regra que mais gera erro de certificação: deve ser bloqueante no sistema.
- **CXR-13** — Aplicável apenas onde não há laboratório designado.

### LAB — Escarro e laboratório

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **LAB-01** | Indicar escarro quando a CXR for sugestiva de TB ativa/antiga, houver sinais ou sintomas, gestante recusar CXR, criança sintomática ou houver incapacidade para CXR. | TI v7 §3; §7 | Obrigatório | Decisão de escarro registrada com justificativa | Panel Physician | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-006 | Verificar se todos os casos elegíveis têm escarro e justificativa. |
| **LAB-02** | Coletar 3 amostras matinais em 3 ocasiões, com intervalo mínimo de 24 horas, preferencialmente em dias consecutivos. | TI v7 §7 | Obrigatório | Registro por amostra (data, hora, volume, qualidade) | Enfermeiro / Laboratório | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-006 | Calcular o intervalo entre as 3 coletas. |
| **LAB-03** | Iniciar a coleta em até 7 dias da CXR; caso contrário, encerrar o processo e reportar à autoridade de imigração. | TI v7 §7 | Obrigatório | Data da CXR, data da 1ª coleta, registro do reporte | Panel Physician | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-006 | Calcular o intervalo CXR → 1ª coleta em todos os casos com escarro. |
| **LAB-04** | Realizar coleta supervisionada no local ou laboratório designado, nunca em casa; não aceitar saliva, não agrupar amostras e obter 5–10 ml. | TI v7 §7; Anexo E | Obrigatório | Checklist de coleta, identificação do coletor, registro de recusa de amostra | Enfermeiro / Coletor | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-006 | Verificar registro de supervisão e de recusa de saliva. |
| **LAB-05** | Confirmar a identidade do candidato na coleta e usar rótulo não removível e à prova de adulteração. | TI v7 §5; Anexo E | Obrigatório | Log de verificação e foto/registro do rótulo | Enfermeiro / Laboratório | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-006 | Rastrear a amostra até o laudo. |
| **LAB-06** | Garantir biossegurança: máscaras adequadas, luvas, ventilação com 12–18 trocas de ar por hora ou área externa, UV e desinfecção. | TI v7 Anexo E | Obrigatório | Laudo de ventilação, rotina de limpeza, registro de EPI | Responsável técnico / Administrativo | `ADM/04_QA` | Vigência + 6 anos | SOP-006 | Inspecionar a sala e o registro diário de ventilação. |
| **LAB-07** | Transportar em recipiente seguro, com cadeia de custódia, refrigeração se acima de 1 hora (nunca congelar) e chegada ao laboratório em até 4 horas. | TI v7 §7; Anexo E | Obrigatório | Registro de transporte, temperatura, horários e assinaturas | Enfermeiro / Laboratório | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-006 | Reconstruir a cadeia de custódia de uma amostra. |
| **LAB-08** | Processar as amostras no laboratório em até 24 horas do recebimento. | TI v7 §7 | Obrigatório | Log do laboratório (recebimento e processamento) | Laboratório | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-007 | Comparar horário de recebimento e de processamento. |
| **LAB-09** | Realizar microscopia AFB (auramina; ZN se necessário), cultura líquida/sólida, confirmação de espécie ao nível MTBC e DST nos positivos. | TI v7 §7 | Obrigatório | Laudo com métodos e resultados por amostra | Laboratório | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-007 | Verificar método e resultado em cada amostra. |
| **LAB-10** | Respeitar os prazos: cultura mínima de 6 semanas (líquido) e 8 (sólido); laudo final em até 10 semanas da coleta; DST em até 10 semanas. | TI v7 §7 | Obrigatório | Datas de coleta, cultura e laudo final | Laboratório | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-007 | Calcular o prazo entre coleta e laudo final. |
| **LAB-11** | Comunicar imediatamente cultura positiva e resistência ao PP; o PP notifica as autoridades britânicas sem demora. | TI v7 §7; Role of the Panel Physician | Obrigatório | Registro de comunicação com data/hora; notificação enviada | Laboratório / Panel Physician | `CASO/07_ENCAMINHAMENTO` | Caso — 3 anos (UK) | SOP-007 | Verificar o tempo entre resultado positivo e notificação. |
| **LAB-12** | Se não houver produção de escarro: repetir supervisão por 7 dias, tentar escarro induzido ou aspiração gástrica e, se persistir, repetir CXR em 3 meses. | TI v7 §7 | Condicional | Registro das tentativas, métodos alternativos e decisão | Panel Physician / Enfermeiro | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-006 | Verificar se as alternativas foram tentadas antes da repetição da CXR. |
| **LAB-13** | Arquivar o laudo laboratorial completo e a evidência de acreditação/designação e de QA do laboratório. | TI v7 §7; Anexo B | Obrigatório | Laudo, certificado de acreditação, relatórios de QA | Laboratório / Panel Physician | `CASO/06_ESCARRO` | Caso — 3 anos (UK) | SOP-007 | Verificar acreditação vigente na data da coleta. |

**Notas do domínio**

- **LAB-01** — PETS: sputumRequired.
- **LAB-03** — Prazo perdido = perda do certificado; deve gerar alerta automático.
- **LAB-06** — A TI descreve teste com tira de papel a 45° para checar fluxo negativo.
- **LAB-07** — O candidato não pode transportar a própria amostra.
- **LAB-09** — PETS: SmearAndCultureResultOptions (Positive, Negative, Inconclusive).
- **LAB-10** — Cultura positiva interrompe o prazo e exige comunicação imediata.
- **LAB-11** — Resistência medicamentosa é notificação obrigatória sem demora.
- **LAB-12** — Indução pode ser usada em crianças a partir de 3 anos.

### CERT — Desfecho e certificado de liberação

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **CERT-01** | Emitir o Clearance Certificate apenas quando não houver suspeita de TB ativa e o processo estiver completo. | TI v7 (Role); §8 | Obrigatório | Certificado, checklist de completude, assinatura do PP | Panel Physician | `CASO/09_CERTIFICADO` | Caso — 3 anos (UK) | SOP-008 | Verificar se o certificado foi emitido após todos os itens obrigatórios. |
| **CERT-02** | Fixar validade de 6 meses a partir da CXR (ou avaliação inicial); escarro negativo não prorroga. | TI v7 §9 | Obrigatório | Data da CXR, data de emissão e data de validade | Panel Physician / Administrativo | `CASO/09_CERTIFICADO` | Caso — 3 anos (UK) | SOP-008 | Recalcular a validade em uma amostra de certificados. |
| **CERT-03** | Registrar no certificado quando ele foi emitido após escarro. | TI v7 §8 | Condicional | Campo específico no certificado | Panel Physician | `CASO/09_CERTIFICADO` | Caso — 3 anos (UK) | SOP-008 | Verificar certificados de casos com escarro. |
| **CERT-04** | Não emitir certificado em caso de TB ativa, recusa/abandono ou processo incompleto, registrando o motivo. | TI v7 §8 | Obrigatório | Registro de não emissão e motivo | Panel Physician | `CASO/09_CERTIFICADO` | Caso — 3 anos (UK) | SOP-008 | Verificar se todos os casos sem certificado têm motivo registrado. |
| **CERT-05** | Garantir conteúdo mínimo: identificação do candidato, clínica, médico, data de emissão, validade, número e referência. | TI v7 (Role); PETS | Obrigatório | PDF do certificado e número sequencial | Administrativo / Panel Physician | `CASO/09_CERTIFICADO` | Caso — 3 anos (UK) | SOP-008 | Verificar unicidade e sequência dos números. |
| **CERT-06** | Emitir e arquivar o certificado eletrônico no PETS, mantendo cópia e log de emissão. | PETS/UKHSA; atualização UK 2025 (certificado eletrônico) | Obrigatório | PDF, número, log/print do PETS, usuário emissor | Panel Physician | `CASO/09_CERTIFICADO` | Caso — 3 anos (UK) | SOP-016 | Conferir se o certificado local corresponde ao emitido no PETS. |
| **CERT-07** | Aplicar a regra de validade para contatos familiares conforme a versão vigente da TI (3 meses na v7; 6 meses na atualização), com regra versionada. | TI v7 §9; atualização UK 2025 | Condicional | Regra cadastrada com vigência; decisão por caso | Panel Physician / TI | `ADM/02_SOPs` | Caso — 3 anos (UK) | SOP-008 | Verificar se a regra aplicada corresponde à versão da TI na data do caso. |
| **CERT-08** | Controlar segunda via, correção e cancelamento com trilha de auditoria, sem sobrescrever o original. | Desenho do sistema (boa prática) | Recomendado | Histórico de versões, motivo, aprovador | Administrativo / Panel Physician | `CASO/09_CERTIFICADO` | Caso + 6 anos | SOP-008 | Verificar se existe versão anterior recuperável. |
| **CERT-09** | Registrar a entrega do certificado ao candidato. | Desenho do sistema (boa prática) | Recomendado | Recibo, e-mail ou log de download | Administrativo | `CASO/10_CORRESPONDENCIA` | Caso — 3 anos (UK) | SOP-008 | Verificar comprovação de entrega em amostra de casos. |

**Notas do domínio**

- **CERT-01** — A decisão é responsabilidade pessoal do Panel Physician, inclusive em caso de dúvida.
- **CERT-02** — PETS: issueDate, expiryDate.
- **CERT-04** — PETS: TBCertNotIssuedReason (TB confirmada/suspeita, prova adiada, desistência).
- **CERT-05** — PETS: certificateNumber, referenceNumber, physicianName, clinicName.
- **CERT-06** — O padrão está migrando do PDF da clínica para o certificado eletrônico oficial.
- **CERT-07** — Requisito de sistema: motor de regras versionado por data de vigência. Não codificar 3 meses como constante.
- **CERT-09** — A TI não exige o recibo, mas ele reduz disputa e fraude.

### REF — Encaminhamento, tratamento e notificações

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **REF-01** | Emitir carta de encaminhamento (Anexo H) para suspeita ou confirmação de TB ativa. | TI v7 §8; Anexo H | Obrigatório | Carta assinada e comprovante de envio | Panel Physician | `CASO/07_ENCAMINHAMENTO` | Caso — 3 anos (UK) | SOP-009 | Verificar se todo caso suspeito/confirmado tem carta. |
| **REF-02** | Dar aconselhamento claro e inequívoco para buscar tratamento imediato e registrar. | TI v7 (Role); §8 | Obrigatório | Nota clínica com assinatura e data | Panel Physician | `CASO/07_ENCAMINHAMENTO` | Caso — 3 anos (UK) | SOP-009 | Verificar se o aconselhamento está datado e assinado. |
| **REF-03** | Notificar as autoridades locais quando exigido por lei e registrar o fato. | TI v7 (Role); §8 | Condicional | Ofício/notificação, protocolo e data | Panel Physician | `CASO/11_DIVULGACOES` | Caso — 3 anos (UK) | SOP-009 | Verificar a exigência local e a evidência da notificação. |
| **REF-04** | Notificar as autoridades britânicas/UKVI conforme diretrizes, incluindo resistência medicamentosa sem demora. | TI v7 (Role); §7; §8 | Obrigatório | Notificação e confirmação de recebimento | Panel Physician | `CASO/11_DIVULGACOES` | Caso — 3 anos (UK) | SOP-009 | Verificar o tempo entre o resultado e a notificação. |
| **REF-05** | Se o PP tratar, seguir protocolo da OMS e nacional, usar medicamentos quality-assured e registrar regime, adesão e desfecho. | TI v7 §8 | Condicional | Plano terapêutico, prescrições, exames, desfecho | Panel Physician | `CASO/08_TRATAMENTO` | Caso — 3 anos (UK) | SOP-009 | Verificar protocolo, medicamentos e registro de desfecho. |
| **REF-06** | Reiniciar a triagem após tratamento completo somente com resumo escrito e pelo menos 6 meses após a avaliação original, comparando as CXRs. | TI v7 §8 | Condicional | Resumo de tratamento, nova triagem e comparação de CXR | Panel Physician | `CASO/08_TRATAMENTO` | Caso — 3 anos (UK) | SOP-009 | Verificar o intervalo e a comparação das imagens. |
| **REF-07** | Fornecer relatórios de tratamento e de contatos para futuras aplicações de visto. | TI v7 Anexo H | Condicional | Relatório final e follow-up de contatos | Panel Physician / Serviço de tratamento | `CASO/08_TRATAMENTO` | Caso — 3 anos (UK) | SOP-009 | Verificar se o relatório contém regime, adesão, desfecho e contatos. |

**Notas do domínio**

- **REF-01** — A carta deve indicar o achado que motivou o encaminhamento.
- **REF-03** — A TI exige que o PP registre o fato de ter notificado.
- **REF-05** — Medicamentos conforme GDF (1ª linha) e IDA/GLC (2ª linha).
- **REF-06** — Nova triagem é cobrada novamente como teste padrão.

### AUD — Auditoria, qualidade e melhoria

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **AUD-01** | Manter programa de auditoria interna documentado: escopo, frequência, auditor, critérios, achados e CAPA. | TI v7 Anexo B; desenho do sistema | Obrigatório | Plano anual, relatórios, matriz de achados, CAPA | Auditor interno / Panel Physician | `ADM/07_Audit` | 6 anos | SOP-012 | Verificar se a auditoria do período foi realizada e se os achados foram fechados. |
| **AUD-02** | Estar pronto para auditoria externa: produzir caso individual, lote por período e listas por condição em prazo curto. | TI v7 Anexo B | Obrigatório | Pacotes de auditoria, índice e teste cronometrado | Panel Physician / Administrativo | `ADM/07_Audit` | 6 anos | SOP-012 | Simular três pedidos: caso específico, mês inteiro e todos com escarro. |
| **AUD-03** | Monitorar indicadores: screenings, certificados, referrals, escarros, documentos faltantes, retenção, auditorias e não conformidades. | Desenho do sistema (boa prática) | Recomendado | Dashboard mensal, definição dos indicadores, série histórica | Gestão / Auditor interno | `REG` | 6 anos | SOP-012 | Verificar se os números do dashboard batem com o Master Register. |
| **AUD-04** | Registrar incidentes e não conformidades, com análise de causa, ação corretiva, prazo e verificação de eficácia. | Desenho do sistema (boa prática) | Obrigatório | Registro de incidentes, CAPA e evidência de fechamento | Gestão / Panel Physician | `ADM/04_QA` | 6 anos | SOP-013 | Escolher um incidente e verificar a eficácia da ação. |
| **AUD-05** | Manter matriz de treinamento e competência por função: consentimento, coleta, radiação, dados e PETS. | TI v7 Anexo B | Obrigatório | Matriz, certificados, avaliações e reciclagens | RH / Panel Physician | `ADM/03_Training` | Vínculo + 3 anos | SOP-014 | Verificar se quem executou cada etapa estava treinado na data. |
| **AUD-06** | Controlar documentos e SOPs com versão, emissão, autor, aprovador, próxima revisão e histórico de alterações. | TI v7 (versão atualizada); desenho do sistema | Obrigatório | SOPs controladas, registro de aprovação e histórico | Gestão da qualidade | `ADM/02_SOPs` | Permanente | SOP-017 | Verificar se a versão em uso é a aprovada e se a revisão está em dia. |
| **AUD-07** | Monitorar atualizações das TI e do PETS e executar análise de impacto e plano de adequação. | TI v7 Anexo B; atualização UK 2025 | Obrigatório | Registro de monitoramento, análise de impacto e plano | Panel Physician / Gestão da qualidade | `ADM/01_UKVI` | Permanente | SOP-017 | Verificar a última data de revisão e a evidência de análise. |

**Notas do domínio**

- **AUD-02** — É o teste que o sistema precisa passar. Se falhar aqui, a estrutura está errada.
- **AUD-03** — Indicadores sem definição escrita viram número decorativo.
- **AUD-05** — A TI exige que assistentes sejam treinados e competentes, com responsabilidade do PP.
- **AUD-06** — Sem controle de versão, não se demonstra uso da TI vigente.
- **AUD-07** — Cadência sugerida: trimestral e sempre que houver comunicado oficial.

### DAD — Proteção de dados e segurança da informação

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **DAD-01** | Definir base legal, finalidade e minimização; publicar aviso de privacidade e limitar a coleta ao necessário. | TI v7 §4; lei local (LGPD/GDPR) | Obrigatório | Aviso de privacidade, ROPA, base legal documentada | DPO / Encarregado | `ADM/08_DPO` | Permanente | SOP-010 | Verificar se os campos coletados têm finalidade declarada. |
| **DAD-02** | Controlar acesso por função, com contas nominais, MFA, menor privilégio e revogação imediata no desligamento. | Desenho do sistema (boa prática) | Obrigatório | Matriz de acessos, configuração de MFA, log de revogação | TI / DPO | `ADM/08_DPO` | Permanente | SOP-010 | Testar acesso de ex-funcionário e de perfil não autorizado. |
| **DAD-03** | Garantir criptografia em repouso e em trânsito, backup testado e armazenamento imutável (WORM) para CXR e registros críticos. | Desenho do sistema (boa prática) | Obrigatório | Configuração, relatório de teste de restore, política de imutabilidade | TI / DPO | `ADM/08_DPO` | Permanente | SOP-010 | Solicitar evidência de restore e de bloqueio de exclusão. |
| **DAD-04** | Registrar acessos e divulgações: quem, quando, para quem e com qual base legal. | TI v7 §4; lei local | Obrigatório | Log de auditoria e registro de divulgações | TI / DPO | `CASO/11_DIVULGACOES` | Caso + 6 anos | SOP-010 | Reconstruir quem acessou um caso nos últimos 12 meses. |
| **DAD-05** | Compartilhar dados apenas por canal seguro e com destinatários autorizados, registrando a transferência. | TI v7 §4 | Obrigatório | Registro de envio, destinatário, base e confirmação | Administrativo / DPO | `CASO/11_DIVULGACOES` | Caso — 3 anos (UK) | SOP-010 | Verificar se houve envio por e-mail pessoal ou link aberto. |
| **DAD-06** | Gerir incidentes de dados com avaliação de risco, notificação conforme a lei aplicável e registro. | Lei local; desenho do sistema | Obrigatório | Registro de incidentes, avaliação e notificações | DPO | `ADM/08_DPO` | 6 anos | SOP-013 | Verificar se o incidente foi avaliado e notificado no prazo. |
| **DAD-07** | Proibir armazenamento em dispositivo pessoal, pen drive ou conta pessoal; usar apenas ambiente institucional aprovado. | Desenho do sistema (boa prática) | Obrigatório | Política assinada, controle técnico (DLP) e auditoria | DPO / TI | `ADM/08_DPO` | Permanente | SOP-010 | Verificar controles de DLP e termos assinados. |
| **DAD-08** | Formalizar contrato/DPA com laboratório, radiologia e fornecedores de TI, incluindo segurança, subcontratação e auditoria. | TI v7 Anexo B; lei local | Obrigatório | Contratos, DPAs e avaliação de fornecedor | Responsável legal / DPO | `ADM/06_Lab` | Vigência + 6 anos | SOP-010 | Verificar cláusulas de confidencialidade, segurança e auditoria. |

**Notas do domínio**

- **DAD-02** — No PETS, cada usuário deve ter conta nominal por função (admin, physician, radiologist).
- **DAD-03** — WORM é o que impede alteração retroativa de um laudo ou certificado.
- **DAD-07** — Este é o ponto que mais derruba clínicas em auditoria de governança documental.

### RET — Retenção, disponibilização e descarte

| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |
|---|---|---|---|---|---|---|---|---|---|
| **RET-01** | Reter o CXR original, medical record form, consent form, todos os result forms, cartas de encaminhamento e detalhes de tratamento por 3 anos. | TI v7 Anexo B; §4 | Obrigatório | Inventário de retenção por caso; verificação periódica | Administrativo / Panel Physician | `CASO (todos)` | Caso — 3 anos (UK) | SOP-011 | Selecionar um caso de 2 anos e verificar todos os itens da lista. |
| **RET-02** | Disponibilizar os registros às autoridades britânicas ou a quem elas indicarem, quando solicitado. | TI v7 Anexo B | Obrigatório | Procedimento e registro de atendimento | Panel Physician | `ADM/07_Audit` | 6 anos | SOP-011 | Simular pedido e medir o tempo de resposta. |
| **RET-03** | Adotar prazo maior quando a lei local exigir (ex.: Brasil, CFM 1.821/2007 — prontuário por 20 anos), prevalecendo sobre o mínimo de 3 anos. | Lei local (exemplo: Brasil) | Obrigatório | Parecer jurídico e política de retenção aprovada | Responsável legal / DPO | `ADM/08_DPO` | Permanente | SOP-011 | Verificar se a política local prevalece e está documentada. |
| **RET-04** | Bloquear a exclusão durante o prazo, registrar exceções e aplicar descarte seguro e certificado ao final. | Desenho do sistema (boa prática) | Obrigatório | Configuração de retenção, certificado de descarte, aprovação | TI / DPO | `ADM/08_DPO` | Permanente | SOP-011 | Tentar excluir um caso em retenção e verificar o bloqueio. |
| **RET-05** | Definir o gatilho de contagem da retenção (data da CXR/avaliação inicial, prorrogada até o desfecho do tratamento quando houver). | Desenho do sistema (a TI não explicita o gatilho) | Recomendado | Regra documentada e campo data_fim_retencao no register | Gestão / DPO | `REG` | Permanente | SOP-011 | Recalcular a data de retenção de uma amostra. |

**Notas do domínio**

- **RET-01** — A TI enumera os documentos; o sistema deve bloquear o fechamento do caso se faltar algum.
- **RET-03** — CRÍTICO: não descartar aos 3 anos se a lei local exigir mais. Confirmar o país da clínica antes de calibrar o sistema.
- **RET-05** — Sem gatilho escrito, cada pessoa calcula de um jeito e a auditoria encontra inconsistência.

## 6.1 Índice de SOPs

Cada requisito aponta para o procedimento que deve governá-lo. As SOPs abaixo são o esqueleto da biblioteca do serviço — a Etapa 4 escreve o conteúdo, mas a numeração já pode ser fixada para evitar retrabalho.

| SOP | Título | Dono | Escopo | Requisitos |
|---|---|---|---|---|
| **SOP-001** | Procedimento de triagem UK TB (fluxo geral) | Panel Physician | Acolhimento, categoria do candidato, sequência de etapas, prazos e critérios de parada. | GOV-01, GOV-03, CLI-01, CLI-02, CLI-03, CLI-04, CLI-06, CLI-08, CLI-09 |
| **SOP-002** | Identificação e supervisão do candidato | Administrativo | Passaporte, documento alternativo, verificação nos 5 estágios, menores e famílias. | ID-01, ID-02, ID-03, ID-04, ID-05 |
| **SOP-003** | Consentimento informado | Panel Physician | Explicação, formulário, tradução, gestante, menor/incapaz, retirada. | CON-01, CON-02, CON-03, CON-05, CON-06, CON-08 |
| **SOP-004** | Aquisição de radiografia de tórax | Radiógrafo | Incidências, técnica, identificação na imagem, repetição, radioproteção. | CLI-05, CXR-01, CXR-02, CXR-03, CXR-05 |
| **SOP-005** | Laudo radiológico e CXR anormal | Radiologista | Codificação Anexo D, prazo de 1 dia, revisão do PP, conduta por achado. | CLI-07, CXR-04, CXR-06, CXR-07, CXR-08, CXR-12, CXR-13, CXR-14 |
| **SOP-006** | Coleta e transporte de escarro | Enfermeiro | Indicação, 3 amostras, supervisão, biossegurança, cadeia de custódia, falha de produção. | ID-06, LAB-01, LAB-02, LAB-03, LAB-04, LAB-05, LAB-06, LAB-07, LAB-12 |
| **SOP-007** | Interface e resultados do laboratório | Laboratório | Acreditação, métodos, prazos, resultados positivos, DST e comunicação. | GOV-07, GOV-08, LAB-08, LAB-09, LAB-10, LAB-11, LAB-13 |
| **SOP-008** | Emissão e controle de certificado | Panel Physician | Critérios, validade, anotação de escarro, não emissão, PETS, segunda via. | CERT-01, CERT-02, CERT-03, CERT-04, CERT-05, CERT-07, CERT-08, CERT-09 |
| **SOP-009** | Encaminhamento, tratamento e notificações | Panel Physician | Carta Anexo H, aconselhamento, notificações, tratamento e re-triagem. | REF-01, REF-02, REF-03, REF-04, REF-05, REF-06, REF-07 |
| **SOP-010** | Proteção de dados e confidencialidade | DPO | Base legal, acesso, compartilhamento, incidentes, fornecedores, mídia pessoal. | ID-07, CON-04, DAD-01, DAD-02, DAD-03, DAD-04, DAD-05, DAD-07, DAD-08 |
| **SOP-011** | Retenção, disponibilização e descarte | DPO / Administrativo | Prazos, gatilho, bloqueio de exclusão, atendimento a autoridades, descarte. | CON-07, RET-01, RET-02, RET-03, RET-04, RET-05 |
| **SOP-012** | Auditoria e garantia da qualidade | Auditor interno | Plano, execução, indicadores, pacote de auditoria e respostas externas. | GOV-05, AUD-01, AUD-02, AUD-03 |
| **SOP-013** | Incidentes, não conformidades e CAPA | Gestão da qualidade | Registro, causa raiz, ação, prazo, eficácia e incidentes de dados. | AUD-04, DAD-06 |
| **SOP-014** | Treinamento e competência | RH / Panel Physician | Matriz por função, certificação, reciclagem e registro profissional. | GOV-02, AUD-05 |
| **SOP-015** | Equipamento e segurança radiológica | Responsável técnico | Manutenção, calibração, dosimetria, QA de imagem e proteção. | CXR-09, CXR-10 |
| **SOP-016** | PETS e sistemas digitais | TI | Acessos, registro, DICOM, certificado eletrônico, backup e reconciliação. | CXR-11, CERT-06 |
| **SOP-017** | Controle de documentos e versão das TI | Gestão da qualidade | Versionamento, aprovação, revisão, monitoramento de atualizações e análise de impacto. | GOV-04, AUD-06, AUD-07 |
| **SOP-018** | Preços e cobrança | Administrativo | Tabela uniforme, adicional de escarro, comunicação às autoridades e variações. | GOV-06 |

## 7. Prazos que o sistema precisa controlar

| Prazo | O que vence | Fonte |
|---|---|---|
| **10 dias úteis** | Agendar a triagem do candidato (preferencialmente em poucos dias). | TI v7 §3 |
| **Antes da triagem** | Consentimento informado assinado e explicado. | TI v7 §4 |
| **1 dia** | Laudo radiológico disponível após a CXR. | TI v7 §6 |
| **7 dias** | Início da coleta de escarro após a CXR; se não, o processo para e é reportado. | TI v7 §7 |
| **≥ 24 horas** | Intervalo mínimo entre as 3 amostras de escarro. | TI v7 §7 |
| **1 hora / 4 horas** | Refrigerar se não transportar em 1h; chegada ao laboratório em até 4h. | TI v7 Anexo E |
| **24 horas** | Processamento da amostra após o recebimento no laboratório. | TI v7 §7 |
| **6 / 8 semanas** | Cultura mínima em meio líquido / sólido, salvo positivo antes. | TI v7 §7 |
| **10 semanas** | Laudo final de cultura e resultado de DST, no máximo. | TI v7 §7 |
| **3 meses** | Repetição da CXR quando não há laboratório acreditado ou não há produção de escarro. | TI v7 §6 e §7 |
| **6 meses** | Validade do certificado a partir da CXR/avaliação inicial. | TI v7 §9 |
| **3 meses** | Validade reduzida para contatos familiares negativos (regra da v7; revisar na versão vigente). | TI v7 §9; update 2025 |
| **6 meses** | Intervalo mínimo para re-triagem após tratamento completo. | TI v7 §8 |
| **3 anos** | Retenção mínima dos registros do caso. | TI v7 Anexo B |

Prazos perdidos não são só atraso: em dois casos eles **encerram o processo** (coleta após 7 dias da CXR e não produção de escarro sem alternativa). O sistema deve gerar alerta antes, não relatório depois.

## 8. Retenção

| Código | Regra | Exemplos |
|---|---|---|
| **Caso — 3 anos (UK)** | Mínimo legal britânico: 3 anos (UKTBTI, Anexo B e §4). Contar a partir da data da CXR/avaliação inicial; se houver tratamento, a partir do desfecho. Pode ser ampliado por lei local (ver RET-03). | CXR original/DICOM, laudo, consentimento, medical record, resultados de escarro, referral, tratamento. |
| **Permanente** | Documento de governança que precisa sobreviver à troca de gestão, para demonstrar conformidade histórica. | Designação UK, versões das TI, SOPs (vigente + superadas), política de retenção. |
| **Vigência + 6 anos** | Enquanto o contrato/apólice estiver vigente e por 6 anos após o término, para cobrir auditoria e litígio. | Seguro profissional, contratos com laboratório/radiologia, tabela de preços. |
| **Vínculo + 3 anos** | Enquanto o profissional estiver ativo e por 3 anos após o desligamento. | Registro profissional, treinamentos, matriz de competência. |
| **6 anos** | Registros de Assurance: auditorias, incidentes, CAPA, reclamações. | Relatórios de auditoria, plano de ação, evidência de fechamento. |
| **Caso + 6 anos** | Acompanha o caso, com 6 anos adicionais para logs e trilhas de acesso/divulgação. | Log de verificação de identidade, registro de divulgações, trilha de emissão de certificado. |

### 8.1 O ponto mais sensível

A TI exige **3 anos** para o CXR original, o medical record form, o consentimento, os result forms, as cartas de encaminhamento e os detalhes de tratamento. Ela **não diz** de que data os 3 anos começam. E ela **não impede** que a lei local exija mais.

- **Gatilho recomendado:** data da CXR/avaliação inicial; se houve tratamento, o desfecho; contar sempre o mais tarde.
- **Piso:** 3 anos (UK).
- **Teto:** o que a lei local exigir. No Brasil, por exemplo, o prontuário deve ser guardado por 20 anos (CFM 1.821/2007) — descartar aos 3 anos seria uma não conformidade local grave.
- **Consequência prática:** a data de descarte precisa ser **calculada e registrada**, não estimada.

## 9. Regras que o sistema deve bloquear (não apenas avisar)

1. Emitir certificado sem consentimento assinado, identidade verificada, CXR e laudo revisado pelo PP.
2. Emitir certificado com CXR codificada como 3.x/4.x sem escarro concluído.
3. Emitir certificado com cultura ou DST positiva.
4. Iniciar coleta de escarro após 7 dias da CXR.
5. Fechar caso com documento obrigatório faltante.
6. Excluir caso dentro do prazo de retenção.
7. Calcular validade do certificado sem considerar a regra vigente na data do caso.
8. Emitir segunda via sobrescrevendo o certificado original.

Essas oito regras são o que separa uma pasta organizada de um sistema auditável.

## 10. Lacunas a confirmar com UKHSA/UKVI

| ID | Tema | Pergunta | Impacto | Ação |
|---|---|---|---|---|
| **L-01** | Versão vigente da TI | A clínica deve operar pela v7 (2019) ou pela versão revisada anunciada em 2025? Qual é a data de vigência e onde está o texto oficial? | Alto — muda validade de certificado, fluxo de família e formato de certificado. | Pedir confirmação escrita à UKHSA (tbscreening@ukhsa.gov.uk) e arquivar a resposta em ADM/01_UKVI. |
| **L-02** | PETS | O uso do PETS é obrigatório para todas as clínicas? Qual o cronograma de migração e o que ainda pode ser feito fora dele? | Alto — define se o registro de referência é o PETS ou o sistema local. | Confirmar com o UKHSA e mapear os campos que precisam ser espelhados no Master Register. |
| **L-03** | Validade para contatos familiares | A regra de 3 meses para contatos negativos ainda vale, ou já vigoram os 6 meses da nova TI? | Médio — risco de certificado com validade errada. | Implementar regra versionada por data de vigência e validar a versão aplicável. |
| **L-04** | Gatilho da retenção de 3 anos | Os 3 anos contam da CXR, da emissão do certificado, do último contato ou do encerramento do tratamento? | Médio — define quando o caso pode ser descartado. | Adotar a regra mais conservadora (RET-05) e registrar a decisão por escrito. |
| **L-05** | Laudo radiológico | Existe modelo obrigatório de laudo ou o Anexo D é suficiente? O UKHSA exige algum formato de exportação? | Médio — afeta o template e a integração. | Validar com o radiologista designado e com o UKHSA. |
| **L-06** | DICOM e assinatura | O UKHSA aceita DICOM como 'original CXR'? Exige assinatura digital ou hash? Por quanto tempo o DICOM deve ficar online? | Médio — define arquitetura de armazenamento e custo. | Confirmar e documentar no SOP-016. |
| **L-07** | Menores e capacidade | Qual é a idade legal de consentimento no país da clínica e como tratar candidatos sem capacidade? | Médio — validade jurídica do consentimento. | Parecer jurídico local e ajuste do formulário. |
| **L-08** | Recusa e desistência | Quais dados devem ser mantidos quando o candidato retira o consentimento ou abandona o processo? | Médio — conflito entre minimização e prova de conduta. | Definir política com o DPO e registrar no SOP-003/SOP-011. |
| **L-09** | Dados de monitoramento | Em que formato e com que periodicidade o UKVI/UKHSA espera receber os 'monitoring data'? | Alto — define o desenho do Master Register e dos relatórios. | Solicitar especificação e criar um relatório de exportação padrão. |
| **L-10** | Laboratório designado | Como comprovar a designação/acreditação do laboratório local e quem a renova? | Alto — sem isso, o caso pode exigir CXR em 3 meses. | Obter carta de designação e certificado vigente; revisar anualmente. |
| **L-11** | Jurisdição | Em qual país a clínica opera? Qual lei de proteção de dados e qual regra de prontuário se aplicam? | Alto — define retenção, consentimento e transferência internacional. | Confirmar antes da Etapa 2. O exemplo brasileiro (20 anos) só vale se for o caso. |
| **L-12** | Certificado eletrônico | Qual é o modelo do certificado eletrônico, quem assina e como o candidato o recebe? | Médio — afeta o fluxo de entrega e o arquivo. | Obter amostra do certificado e o fluxo oficial no PETS. |

## 11. Decisões necessárias para a Etapa 2

| ID | Decisão | Opções | Recomendação |
|---|---|---|---|
| **D-01** | País / jurisdição da clínica | Brasil; outro país de alta incidência; operação em mais de um país | **Confirmar antes de qualquer configuração de retenção. O prazo e o consentimento mudam com a lei local.** A TI fixa o mínimo britânico; a lei local pode exigir mais (ex.: 20 anos no Brasil). |
| **D-02** | Plataforma documental | Microsoft 365/SharePoint; Google Workspace; ambiente próprio | **M365/SharePoint se houver conta institucional, pelas retenções, DLP, versionamento e audit log nativos.** Governança demonstrável é tão importante quanto armazenar. OneDrive pessoal não serve. |
| **D-03** | Master Register | Planilha Excel compartilhada; lista do SharePoint; banco/app próprio | **Lista do SharePoint como fonte de verdade; Excel apenas como exportação/análise.** Planilha compartilhada gera conflito de versão, não tem trilha confiável e quebra em auditoria. |
| **D-04** | Armazenamento do DICOM | SharePoint; PACS/Orthanc; S3 com link | **PACS/Orthanc ou S3 com índice no Register; SharePoint guarda o laudo, a cópia de visualização e o link.** SharePoint não visualiza DICOM bem e o volume pode inviabilizar backup. O PETS já usa S3. |
| **D-05** | Estrutura e metadados | Pastas por caso; biblioteca com metadados e views; híbrido | **Híbrido: pasta por caso (compatibilidade e exportação) + metadados obrigatórios (status, ano, categoria, retenção).** Pasta sozinha não responde 'todos os casos de agosto com escarro'. Metadado responde. |
| **D-06** | Idioma dos formulários | Português; inglês; bilíngue | **Formulários operacionais bilíngues; documentos oficiais em inglês, conforme a TI.** O candidato precisa entender o consentimento; o auditor britânico precisa ler o registro. |
| **D-07** | Volume e dimensionamento | Menos de 100 casos/mês; 100–500; acima de 500 | **Levantar a média e o pico antes de definir licenças, storage e automações.** Muda o desenho de permissões, backup e o custo do DICOM. |
| **D-08** | Papéis e permissões | Admin, Panel Physician, Radiologista, Enfermeiro, DPO, Auditor | **Definir a matriz de acesso por papel e testar com casos reais antes de migrar.** A auditoria vai pedir a matriz e o log de acessos. |
| **D-09** | Integração com PETS | Manual (dupla digitação); exportação periódica; integração via API | **Começar manual com conferência semanal; evoluir para exportação reconciliada.** A API pode não estar disponível para a clínica. O importante é não divergir. |
| **D-10** | Assinatura e integridade | Assinatura eletrônica qualificada; hash + log; digitalização de assinatura | **Assinatura eletrônica com hash e timestamp para laudo e certificado; digitalização apenas para o que nasceu em papel.** Sem integridade demonstrável, não se prova que o laudo não foi alterado. |

## 12. Fontes

| Documento | Órgão | Data | Uso |
|---|---|---|---|
| [UK Tuberculosis Technical Instructions (UKTBTI) — Version 7](https://www.gov.uk/government/publications/uk-tuberculosis-technical-instructions) | Public Health England / UK Visas and Immigration | março de 2019 (publicado em 7 de maio de 2019) | Fonte normativa principal: §3 a §9 e Anexos A a H. |
| [Tuberculosis screening (guidance)](https://www.gov.uk/guidance/tuberculosis-screening) | UK Health Security Agency | atualizado em 10 de março de 2026 | Contexto do programa: 101 países, CXR + sintomas, quality assurance, relação de clínicas aprovadas. |
| [Tuberculosis tests for visa applicants](https://www.gov.uk/tb-test-visa) | GOV.UK | consulta em novembro de 2026 | Regra para o candidato: estadia ≥ 6 meses, países listados, validade de 6 meses, gestantes e crianças. |
| [UK Technical Instructions update 2025](https://panelphysician.org/file/06b39d72-f9e6-49ff-912e-e74b5b435f35/K2%20United%20Kingdom%20Technical%20Instructions%20%28Repeat%20A3%29.pdf) | UKHSA — Dr Vinay Ketkar (Principal Port Medical Inspector) | 2025 | Sinaliza a nova versão das TI, o sistema PETS, certificado eletrônico, TB laríngea e a mudança da validade para familiares. |
| [Complete UK pre-entry health screening — Beta reassessment](https://digitalhealth.blog.gov.uk/2026/10/14/ukhsa-complete-uk-pre-entry-health-screening-beta-reassessment/) | DHSC / UKHSA (Digital Health blog) | 14 de outubro de 2026 | Confirma o serviço digital para clínicas (administrativos, panel physicians e radiologistas), com mais de 300 clínicas. |
| [PETS — Pre-Entry TB Screening (código e documentação)](https://github.com/UKHSA-Internal/pre-entry-tb-screening-app) | UKHSA | consulta em novembro de 2026 | Modelo de dados: applicant, application, medical screening, CXR/DICOM, radiological outcome, sputum decision, certificate, travel info, audit service. |
| [Resolução CFM nº 1.821/2007 e LGPD (Lei 13.709/2018)](undefined) | Brasil (exemplo de lei local) | 2007 / 2018 | Exemplo de prazo local maior: prontuário por 20 anos. Aplicável apenas se a clínica estiver no Brasil. |

## 13. Controle de versão

| Versão | Data | Autor | Alteração |
|---|---|---|---|
| 1.0 | 11/11/2026 | Equipe do projeto — UK TB Screening Digital Library | Primeira versão: 95 requisitos, 11 domínios, estrutura de arquivo e regras de bloqueio. |

---

*Documento gerado a partir de `_FONTE/dados`. Para alterar, edite os arquivos de dados e rode `node _FONTE/gerar.mjs`.*
