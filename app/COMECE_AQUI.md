# Comece aqui — configuração do banco e primeiro acesso

Guia curto para colocar o sistema no ar. Siga na ordem.

---

## 1. O que você precisa ter em mãos

No painel do Supabase do seu projeto, colete **três valores**:

| Valor | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings** (engrenagem) → **API** / **Data API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project Settings** → **API Keys** → anon / publishable |
| `DATABASE_URL` | Botão **Connect** (topo) → **Session pooler** → copie a URI |

> A `DATABASE_URL` contém a **senha do banco**. Se você não sabe a senha:
> **Project Settings → Database → Reset database password**.
> Prefira uma senha só com letras e números (evita problemas com `@`, `#`, `%` na URL).

---

## 2. Criar o arquivo `.env.local`

O arquivo fica **dentro da pasta `app`** (não na raiz do projeto):

```
UK TB Screening\app\.env.local
```

Conteúdo (troque pelos seus valores):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA-CHAVE-ANON

DATABASE_URL="postgresql://postgres.SEU_REF:SUA_SENHA@aws-0-REGIAO.pooler.supabase.com:5432/postgres"
```

Atenção:

- O arquivo se chama exatamente `.env.local` (com ponto no início).
- Não coloque espaço antes/depois do `=`.
- Mantenha as aspas na `DATABASE_URL`.
- Não use `NEXT_PUBLIC_` na `DATABASE_URL`.

---

## 3. Aplicar as migrações

Abra o PowerShell e rode:

```powershell
cd "C:\Users\felip\OneDrive\Área de Trabalho\Sistema\Projetos\UK TB Screening\app"
node -v
npm install
npm run db:push
```

O esperado é terminar com:

```
→ 0001_schema.sql ... OK
→ 0002_functions.sql ... OK
→ 0003_rls.sql ... OK
→ 0004_seed.sql ... OK

Resumo:
  tabelas em public: 20
  bucket 'casos': criado (privado)
  app_settings: 3 parâmetro(s)

Banco pronto.
```

Se aparecer `DATABASE_URL não encontrada`, o `.env.local` não está na pasta `app` ou o nome está errado.

---

## 4. Criar o primeiro usuário (admin)

1. No Supabase: **Authentication → Users → Add user → Create new user**.
2. Informe e-mail e senha.
3. Marque **Auto Confirm User**.
4. Copie o **UUID** do usuário.

No **SQL Editor**, rode (é uma instrução curta, não precisa de arquivo):

```sql
insert into public.profiles (id, full_name, role, professional_registry)
values ('COLE-O-UUID', 'Seu nome completo', 'admin', 'CRM 000000');
```

---

## 5. Rodar a aplicação

```powershell
cd "C:\Users\felip\OneDrive\Área de Trabalho\Sistema\Projetos\UK TB Screening\app"
npm run dev
```

Abra <http://localhost:3000> e entre com o e-mail/senha do admin.

Se a tela de login disser **“Supabase não configurado”**, as duas variáveis
`NEXT_PUBLIC_...` não foram lidas: confira o `.env.local` e reinicie o `npm run dev`.

---

## 6. Problemas comuns

| Mensagem | Causa provável | Solução |
|---|---|---|
| `DATABASE_URL não encontrada` | arquivo ausente ou no lugar errado | criar `app/.env.local` |
| `password authentication failed` | senha errada ou caractere especial na URL | resetar a senha para algo simples |
| `getaddrinfo ENOTFOUND` | host/ref incorreto | copiar a URI de novo em **Connect** |
| `self-signed certificate` / SSL | URI direta em vez do pooler | usar **Session pooler** |
| `Supabase não configurado` no navegador | `.env.local` sem as chaves públicas | preencher e reiniciar o dev |
| Erro no SQL Editor citando linha do meio do arquivo | editor executou só um trecho | usar `npm run db:push` |

---

## 7. Depois que o banco estiver pronto

1. Criar os demais usuários (médico, radiologista, secretaria, enfermagem).
2. Cadastrar a clínica (o seed já cria uma; ajuste o nome depois).
3. Abrir um caso de teste e percorrer as abas.
4. Publicar na Vercel e adicionar o domínio em **Authentication → URL Configuration**.
