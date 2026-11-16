#!/usr/bin/env node
/**
 * Aplica as migrações de supabase/migrations no banco remoto.
 *
 * Uso:
 *   1. Coloque DATABASE_URL no app/.env.local (Connection string do Supabase).
 *   2. npm run db:push
 *
 * Cada arquivo é executado dentro de uma transação implícita: se falhar,
 * nada daquele arquivo é gravado.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  const content = readFileSync(".env.local", "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key] !== undefined) continue;
    let value = raw.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function maskUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}${parsed.pathname}`;
  } catch {
    return "(URL inválida)";
  }
}

loadEnvLocal();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    [
      "DATABASE_URL não encontrada.",
      "",
      "No Supabase: botão Connect → Session pooler → copie a URI.",
      "Depois crie app/.env.local com:",
      "",
      '  DATABASE_URL="postgresql://postgres.SEU_REF:SENHA@aws-0-REGIAO.pooler.supabase.com:5432/postgres"',
      "",
      "Não use prefixo NEXT_PUBLIC_ e não comite esse arquivo.",
    ].join("\n"),
  );
  process.exit(1);
}

const migrationsDir = join(process.cwd(), "supabase", "migrations");
if (!existsSync(migrationsDir)) {
  console.error(`Pasta não encontrada: ${migrationsDir}`);
  process.exit(1);
}

const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("Nenhuma migração encontrada.");
  process.exit(1);
}

console.log(`Banco: ${maskUrl(connectionString)}`);
console.log(`Migrações: ${files.join(", ")}\n`);

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  application_name: "uktbscreen-migrations",
});

try {
  await client.connect();
} catch (error) {
  console.error(`Falha ao conectar: ${error.message}`);
  process.exit(1);
}

let failed = false;
for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  process.stdout.write(`→ ${file} ... `);
  try {
    await client.query(sql);
    console.log("OK");
  } catch (error) {
    failed = true;
    console.log("ERRO");
    console.error(`\n${error.message}`);
    if (error.detail) console.error(`Detalhe: ${error.detail}`);
    if (error.hint) console.error(`Dica: ${error.hint}`);
    break;
  }
}

if (!failed) {
  try {
    const tables = await client.query(
      `select count(*)::int as total from information_schema.tables
       where table_schema = 'public' and table_type = 'BASE TABLE'`,
    );
    const bucket = await client.query(
      `select id, public, file_size_limit from storage.buckets where id = 'casos'`,
    );
    const settings = await client.query(`select count(*)::int as total from public.app_settings`);

    console.log("\nResumo:");
    console.log(`  tabelas em public: ${tables.rows[0].total}`);
    console.log(`  bucket 'casos': ${bucket.rows[0] ? "criado (privado)" : "AUSENTE"}`);
    console.log(`  app_settings: ${settings.rows[0].total} parâmetro(s)`);
    console.log("\nBanco pronto.");
  } catch (error) {
    console.error(`\nMigrações aplicadas, mas a verificação falhou: ${error.message}`);
    failed = true;
  }
}

await client.end();
process.exit(failed ? 1 : 0);
