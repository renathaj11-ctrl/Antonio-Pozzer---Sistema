# Triagem TB — Reino Unido · Aplicação web

Sistema de prontuário e auditoria para triagem pré-entrada de tuberculose (UK pre-entry TB screening), operado por Panel Physician, radiologista, secretaria e enfermagem.

- **Next.js 15.5.29** (App Router, Server Actions) · React 19.1.10 · TypeScript 5.9
- **Supabase** (Postgres + Auth + Storage)
- **Vercel** (hospedagem)
- Interface em **português**, regras UKVI/UKHSA em inglês na fonte

> Esta pasta contém apenas código e documentação. **Nenhum dado de paciente deve ser gravado aqui.**

---

## 1. O que o sistema faz

1. Abre o caso com numeração automática `UKTB-AAAA-NNNN`.
2. Guia o fluxo em 10 abas: resumo, identidade, consentimento, triagem, radiografia, laudo, escarro, desfecho, documentos e histórico.
3. Bloqueia a emissão do certificado quando falta etapa obrigatória — tanto na interface quanto por gatilho no banco.
4. Calcula prazos: escarro em até 7 dias da CXR, validade do certificado em 6 meses, retenção local de 20 anos.
5. Mantém trilha de auditoria automática em todas as tabelas clínicas.
6. Guarda arquivos (PDF, imagem, DICOM) em bucket privado, com URL assinada e upload direto ao Supabase.

---

## 2. Estrutura

```
app/
├── src/
│   ├── app/
│   │   ├── (app)/                 # área autenticada
│   │   │   ├── layout.tsx         # shell + sidebar
│   │   │   ├── painel/            # dashboard
│   │   │   ├── casos/             # lista, novo, [id] com abas
│   │   │   ├── auditoria/         # admin + auditor
│   │   │   └── configuracoes/     # equipe, clínica, regras
│   │   ├── entrar/                # login
│   │   ├── api/arquivo/           # download assinado
│   │   ├── icon.png               # favicon (símbolo da marca)
│   │   └── layout.tsx, globals.css
│   ├── components/
│   │   ├── ui.tsx                 # Card, Badge, Field, Alert...
│   │   ├── nav.tsx                # navegação ativa
│   │   └── case/                  # uma seção por aba
│   ├── lib/
│   │   ├── actions/               # server actions (auth, casos, documentos)
│   │   ├── supabase/              # clients server/browser
│   │   ├── auth.ts                # sessão, papéis, canWrite
│   │   ├── data.ts                # consultas
│   │   ├── rules.ts               # regras, checklist, bloqueios
│   │   ├── types.ts               # tipos do domínio
│   │   └── format.ts, form.ts
│   └── middleware.ts              # refresh de sessão + redirect
├── public/marca/                  # logo Antonio Pozzer (fundo transparente)
└── supabase/migrations/           # 0001 → 0004
```

### Identidade visual

O tema fica em `src/app/globals.css`, nos tokens `:root` (cores, raios, sombras).
A paleta vem do logo: azul-marinho `#0b2b5b`, azul clínico `#2e7bc4` e fundo
`#f2f7fd`. Os arquivos da marca estão em `public/marca/`:

- `logo-antonio-pozzer.png` — logo completo, fundo transparente (sidebar e login)
- `logo-marca.png` / `logo-marca-256.png` — só o símbolo (crachás, documentos, ícone)
- `src/app/icon.png` — favicon gerado a partir do símbolo

Para trocar o logo, substitua os arquivos mantendo os nomes. O fundo branco do
PNG original foi removido por preenchimento a partir das bordas; use sempre
arquivos com transparência para não criar caixa branca sobre o azul.

---

## 3. Banco de dados

| Arquivo | Conteúdo |
|---|---|
| `0001_schema.sql` | enums, tabelas, índices |
| `0002_functions.sql` | numeração, retenção, auditoria, gatilho do certificado, `v_case_overview` |
| `0003_rls.sql` | papéis, RLS, Storage, proteção contra autopromoção |
| `0004_seed.sql` | clínica inicial, `app_settings`, instruções do primeiro admin |

Pontos importantes:

- **Sem políticas de DELETE**: registros clínicos são imutáveis pela aplicação. Exclusão de arquivo é restrita ao admin no Storage.
- **`v_case_overview`** consolida o estado do caso (identidade, consentimento, CXR, laudo, escarro, retenção UK). Usa `security_invoker = on`, respeitando a RLS.
- **Retenção**: `cases.retention_until` = último registro + 20 anos (CFM 1.821/2007). O mínimo britânico de 3 anos aparece em `uk_retention_until`, apenas informativo.
- **Gatilho `enforce_certificate_rules()`**: bloqueia certificado sem consentimento, identidade, CXR vigente, laudo revisado, resultado classificado e escarro negativo quando indicado.
- **Gatilho `guard_profile_changes()`**: impede que um usuário mude o próprio papel ou se reative.

### 3.1 Configurar o Supabase

1. Crie um projeto em <https://supabase.com>.
2. Aplique as migrações — **opção A (terminal, recomendada)** ou **opção B (SQL Editor)**.
3. Em **Authentication → Providers**, mantenha e-mail/senha habilitado.
4. Em **Authentication → URL Configuration**, adicione a URL da Vercel e `http://localhost:3000`.
5. Em **Storage**, confirme o bucket `casos` (privado, 50 MB, tipos permitidos).
6. Copie `Project URL` e `anon key` em **Project Settings → API**.

#### Opção A — terminal (recomendada)

No Supabase, clique em **Connect** e copie a URI do **Session pooler** (porta 5432).
Acrescente ao `app/.env.local`:

```env
DATABASE_URL="postgresql://postgres.SEU_REF:SENHA@aws-0-REGIAO.pooler.supabase.com:5432/postgres"
```

Depois:

```powershell
cd "UK TB Screening\app"
npm run db:push
```

O script executa `0001` → `0004` em ordem, para no primeiro erro e mostra um resumo
(tabelas, bucket e parâmetros). Cada arquivo roda em transação: se falhar, nada dele é gravado.

> `DATABASE_URL` é segredo de servidor. Não use o prefixo `NEXT_PUBLIC_` e não comite o `.env.local`.

#### Opção B — SQL Editor do Supabase

No **SQL Editor**, abra um arquivo por vez: `0001`, `0002`, `0003`, `0004`.
Depois de colar, pressione **Ctrl+A** (garante que o arquivo inteiro está selecionado) e
clique em **Run**. Se o editor executar apenas um trecho e apontar erro numa linha do meio
do arquivo, recarregue a página, cole novamente, **Ctrl+A** e Run.

### 3.2 Primeiro administrador

1. **Authentication → Users → Add user** (e-mail + senha; marque “auto confirm”).
2. Copie o UUID.
3. No SQL Editor:

```sql
insert into public.profiles (id, full_name, role, professional_registry)
values ('UUID-DO-USUARIO', 'Nome do médico', 'admin', 'CRM 000000');
```

4. Entre em `/entrar`.

> Novos usuários: crie em Authentication e insira o perfil manualmente. A inserção de perfil por não-admin é bloqueada pela RLS.

---

## 4. Rodar localmente

```powershell
cd "UK TB Screening\app"
copy .env.example .env.local
# edite .env.local com URL e anon key
npm install
npm run dev
```

Abra <http://localhost:3000>.

Scripts:

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção
npm run start      # servir o build
npm run typecheck  # tsc --noEmit
```

Sem `.env.local`, a tela de login mostra as instruções de configuração — útil para validar o build.

---

## 5. Perfis e permissões

| Área | admin | médico | radiologista | secretaria | enfermeiro | auditor |
|---|---|---|---|---|---|---|
| Criar/editar caso | ✓ | ✓ | — | ✓ | ✓ | leitura |
| Identidade / consentimento / triagem | ✓ | ✓ | — | ✓ | ✓ | leitura |
| CXR / laudo | ✓ | ✓ | ✓ | — | ✓ | leitura |
| Escarro | ✓ | ✓ | — | ✓ | ✓ | leitura |
| Certificado | ✓ | ✓ | — | — | — | leitura |
| Encaminhamento / tratamento | ✓ | ✓ | — | ✓ | ✓ | leitura |
| Anexar documentos | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Auditoria | ✓ | — | — | — | — | ✓ |
| Cadastro de equipe/clínica | ✓ | — | — | — | — | — |

As permissões são aplicadas em duas camadas: `canWrite()` esconde/desabilita ações na interface e a RLS rejeita a operação no banco.

> Observação: o radiologista pode salvar CXR e laudo, mas não altera o status do caso. A transição de status é feita pelo médico/secretaria; o sistema tenta atualizar e ignora a falha de permissão.

---

## 6. Regras implementadas

| Regra | Onde |
|---|---|
| Numeração `UKTB-AAAA-NNNN` | `next_case_number()` + trigger |
| Certificado só com checklist completo | `certificateBlockers()` + `enforce_certificate_rules()` |
| Escarro positivo impede certificado | gatilho + bloqueio na UI |
| Escarro: início ≤ 7 dias da CXR | `sputum_deadline` na visão + alerta |
| 3 amostras com ≥ 24 h | orientação na tela + registro por amostra |
| Validade de 6 meses da CXR | `certificateExpiry()` |
| Contato familiar negativo: 3 meses (v7) | regra versionada em `app_settings` |
| Retenção 20 anos do último registro | triggers `recalc_retention()` |
| Re-triagem ≥ 6 meses pós-tratamento | aviso na aba Desfecho |
| Auditoria imutável | `log_audit()` em todas as tabelas clínicas |
| Sem exclusão de prontuário | RLS sem política de DELETE |

### Regras que precisam de confirmação oficial

A versão pública consolidada é a **UKTBTI v7 (2019)**. A atualização de 2025 menciona novo TI, PETS e certificado eletrônico. Antes de mudar prazos ou a validade de 3 meses para familiares, confirme por escrito com **tbscreening@ukhsa.gov.uk** e registre a decisão.

---

## 7. Segurança e LGPD

- Dados de saúde são **dados sensíveis** (LGPD art. 11). Base legal: consentimento do requerente + obrigação legal do processo de visto.
- Bucket privado; nenhum arquivo é público. Downloads usam URL assinada de 120 s.
- Upload usa **signed upload URL**: o arquivo não passa pela Vercel (limite de 4,5 MB) e vai direto ao Supabase.
- Sessão em cookies `httpOnly` gerenciada por `@supabase/ssr`; `middleware.ts` renova e protege rotas.
- Trilha de auditoria com autor, data/hora e conteúdo alterado.
- Retenção calculada, não estimada. Descarte somente por rotina administrativa com `service_role`.
- **Não** use a `service_role` no cliente. Ela não é necessária para o funcionamento do app.
- Configure backup e PITR no Supabase conforme a política da clínica.
- Recomendado: MFA para admin e médico, e revisão trimestral de acessos.

---

## 8. Deploy na Vercel

1. Suba o repositório no GitHub (o `.gitignore` já exclui `.env*`).
2. Na Vercel: **Add New → Project**, selecione o repositório.
3. **Root Directory**: `UK TB Screening/app`.
4. Framework: Next.js (detectado automaticamente).
5. Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy.
7. Copie o domínio de produção para **Supabase → Authentication → URL Configuration**.
8. Teste: login, criação de caso, upload de um PDF pequeno, emissão bloqueada, auditoria.

### Limite de upload

O bucket aceita 50 MB por arquivo. DICOM maiores exigem:

- Supabase Pro com limite maior, **ou**
- armazenamento externo (S3/PACS) com referência no caso, **ou**
- envio do estudo compactado/segmentado.

O caminho e o hash SHA-256 ficam registrados em `case_documents`.

---

## 9. Limitações conhecidas

- Sem envio de e-mail/SMS (reagendamento é manual).
- Sem assinatura digital do certificado; anexe a via assinada em Documentos.
- Sem integração com PETS/UKVI.
- Uma clínica semeada; o schema suporta múltiplas, mas não há tela de cadastro.
- Sem testes automatizados de UI; validação atual é `typecheck` + `build` + smoke test.
- Regras versionadas em `app_settings` são informativas; alterações de cálculo exigem deploy.

## 10. Backlog sugerido

1. Tela de cadastro/edição de clínica e de equipe (admin).
2. Exportação do “audit pack” por caso em PDF/ZIP.
3. Alertas por e-mail para prazos de escarro e laudo.
4. Integração com PETS e assinatura eletrônica.
5. Testes E2E (Playwright) dos fluxos críticos.
6. Painel de indicadores (tempo até laudo, % escarro no prazo, positividade).
