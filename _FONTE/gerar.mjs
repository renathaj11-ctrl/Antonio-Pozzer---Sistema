// Gera a Matriz de Requisitos em Markdown, CSV e XLSX a partir de _FONTE/dados.
// Uso: node _FONTE/gerar.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

import {
  meta, dominios, obrigacoes, requisitos, retencaoRegras, prazos,
  estrutura, mapeamento, fontes, lacunas, decisoes, sops,
} from "./dados/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const destino = path.join(raiz, "00_ADMINISTRATION", "01_Home_Office_UKVI");
fs.mkdirSync(destino, { recursive: true });

const base = `Matriz_Requisitos_Panel_Physician_v${meta.versao}`;
const porDom = (id) => requisitos.filter((r) => r.dom === id);
const dataBR = meta.data.split("-").reverse().join("/");
const resumo = meta.resumo.replace("{total}", requisitos.length).replace("{dominios}", dominios.length);

// ---------------------------------------------------------------- Markdown
const esc = (s = "") => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
const contagem = (campo) =>
  Object.entries(requisitos.reduce((acc, r) => ((acc[r[campo]] = (acc[r[campo]] || 0) + 1), acc), {}))
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

let md = `# ${meta.titulo}

**${meta.subtitulo}**

| | |
|---|---|
| Versão | ${meta.versao} |
| Data | ${dataBR} |
| Status | **${meta.status}** |
| Autor | ${meta.autor} |

> **Aviso.** ${meta.aviso}

${resumo}

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
| Requisitos mapeados | **${requisitos.length}** |
| Domínios | **${dominios.length}** |
| Obrigatórios | **${requisitos.filter((r) => r.obr === "Obrigatório").length}** |
| Condicionais | **${requisitos.filter((r) => r.obr === "Condicional").length}** |
| Recomendados (boa prática) | **${requisitos.filter((r) => r.obr === "Recomendado").length}** |
| Com teste de auditoria definido | **${requisitos.filter((r) => r.teste).length}** |

| Domínio | Requisitos |
|---|---|
${dominios.map((d) => `| ${d.id} — ${d.nome} | ${porDom(d.id).length} |`).join("\n")}

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
${estrutura.map((e) => `| \`${e.codigo}\` | \`${e.caminho}\` | ${esc(e.desc)} |`).join("\n")}

### 5.1 Ajustes à estrutura original

| Estrutura original | Estrutura v1.0 | Motivo |
|---|---|---|
${mapeamento.map((m) => `| ${esc(m.original)} | ${esc(m.v1)} | ${esc(m.motivo)} |`).join("\n")}

**A regra de ouro:** cada documento tem **um único original**. As pastas transversais (referrals, certificados, laboratório) guardam **índices**, não cópias. Cópia em dois lugares é a forma mais rápida de perder a versão válida.

## 6. Matriz de requisitos

`;

for (const d of dominios) {
  md += `### ${d.id} — ${d.nome}\n\n`;
  md += `| ID | Requisito | Fonte | Obrig. | Evidência a arquivar | Responsável | Local | Retenção | SOP | Teste de auditoria |\n`;
  md += `|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of porDom(d.id)) {
    md += `| **${r.id}** | ${esc(r.req)} | ${esc(r.fonte)} | ${r.obr} | ${esc(r.evid)} | ${esc(r.resp)} | \`${esc(r.local)}\` | ${esc(r.ret)} | ${r.sop} | ${esc(r.teste)} |\n`;
  }
  const comObs = porDom(d.id).filter((r) => r.obs);
  if (comObs.length) {
    md += `\n**Notas do domínio**\n\n`;
    for (const r of comObs) md += `- **${r.id}** — ${esc(r.obs)}\n`;
  }
  md += "\n";
}

md += `## 6.1 Índice de SOPs

Cada requisito aponta para o procedimento que deve governá-lo. As SOPs abaixo são o esqueleto da biblioteca do serviço — a Etapa 4 escreve o conteúdo, mas a numeração já pode ser fixada para evitar retrabalho.

| SOP | Título | Dono | Escopo | Requisitos |
|---|---|---|---|---|
${sops.map((s) => {
  const ligados = requisitos.filter((r) => r.sop === s.id);
  return `| **${s.id}** | ${esc(s.titulo)} | ${esc(s.dono)} | ${esc(s.escopo)} | ${ligados.length ? ligados.map((r) => r.id).join(", ") : "—"} |`;
}).join("\n")}

## 7. Prazos que o sistema precisa controlar

| Prazo | O que vence | Fonte |
|---|---|---|
${prazos.map((p) => `| **${esc(p.prazo)}** | ${esc(p.o_que)} | ${esc(p.fonte)} |`).join("\n")}

Prazos perdidos não são só atraso: em dois casos eles **encerram o processo** (coleta após 7 dias da CXR e não produção de escarro sem alternativa). O sistema deve gerar alerta antes, não relatório depois.

## 8. Retenção

| Código | Regra | Exemplos |
|---|---|---|
${retencaoRegras.map((r) => `| **${esc(r.codigo)}** | ${esc(r.regra)} | ${esc(r.exemplos)} |`).join("\n")}

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
${lacunas.map((l) => `| **${l.id}** | ${esc(l.tema)} | ${esc(l.pergunta)} | ${esc(l.impacto)} | ${esc(l.acao)} |`).join("\n")}

## 11. Decisões necessárias para a Etapa 2

| ID | Decisão | Opções | Recomendação |
|---|---|---|---|
${decisoes.map((d) => `| **${d.id}** | ${esc(d.decisao)} | ${esc(d.opcoes)} | **${esc(d.recomendacao)}** ${esc(d.porque)} |`).join("\n")}

## 12. Fontes

| Documento | Órgão | Data | Uso |
|---|---|---|---|
${fontes.map((f) => `| [${esc(f.nome)}](${f.url}) | ${esc(f.orgao)} | ${esc(f.data)} | ${esc(f.uso)} |`).join("\n")}

## 13. Controle de versão

| Versão | Data | Autor | Alteração |
|---|---|---|---|
| ${meta.versao} | ${dataBR} | ${meta.autor} | Primeira versão: ${requisitos.length} requisitos, 11 domínios, estrutura de arquivo e regras de bloqueio. |

---

*Documento gerado a partir de \`_FONTE/dados\`. Para alterar, edite os arquivos de dados e rode \`node _FONTE/gerar.mjs\`.*
`;

fs.writeFileSync(path.join(destino, `${base}.md`), md, "utf8");

// ---------------------------------------------------------------- CSV
const cab = ["ID", "Domínio", "Requisito", "Fonte", "Obrigação", "Evidência a arquivar", "Responsável", "Local", "Retenção", "SOP", "Teste de auditoria", "Observações"];
const nomeDom = (id) => dominios.find((d) => d.id === id)?.nome || id;
const csvEsc = (v) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
const linhas = requisitos.map((r) => [
  r.id, nomeDom(r.dom), r.req, r.fonte, r.obr, r.evid, r.resp, r.local, r.ret, r.sop, r.teste, r.obs,
].map(csvEsc).join(";"));
fs.writeFileSync(path.join(destino, `${base}.csv`), "\uFEFF" + [cab.map(csvEsc).join(";"), ...linhas].join("\r\n"), "utf8");

// ---------------------------------------------------------------- XLSX
const wb = new ExcelJS.Workbook();
wb.creator = meta.autor;
wb.created = new Date();
wb.title = `${meta.titulo} v${meta.versao}`;

const COR = {
  header: "FF123B4A",
  headerTxt: "FFFFFFFF",
  banda: "FFF2F7F8",
  destaque: "FFE8F1F3",
  borda: "FFD5DEE0",
  vermelho: "FFB42318",
  ambar: "FFB54708",
  verde: "FF067647",
};

const bordaFina = { style: "thin", color: { argb: COR.borda } };
const todas = { top: bordaFina, left: bordaFina, bottom: bordaFina, right: bordaFina };

function titulo(ws, texto, larguraCols) {
  ws.mergeCells(1, 1, 1, larguraCols);
  const c = ws.getCell(1, 1);
  c.value = texto;
  c.font = { bold: true, size: 14, color: { argb: "FF0B2B33" } };
  c.alignment = { vertical: "middle" };
  ws.getRow(1).height = 26;
}

function cabecalho(ws, linha, colunas) {
  const r = ws.getRow(linha);
  colunas.forEach((h, i) => {
    const c = r.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: COR.headerTxt }, size: 9 };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.header } };
    c.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    c.border = todas;
  });
  r.height = 30;
}

// --- Leia-me
const wsL = wb.addWorksheet("Leia-me", { views: [{ showGridLines: false }] });
wsL.columns = [{ width: 2 }, { width: 26 }, { width: 105 }];
titulo(wsL, `${meta.titulo} — v${meta.versao}`, 3);
const infos = [
  ["Subtítulo", meta.subtitulo],
  ["Data", dataBR],
  ["Status", meta.status],
  ["Autor", meta.autor],
  ["Requisitos", `${requisitos.length} em ${dominios.length} domínios`],
  ["Aviso", meta.aviso],
];
let l = 3;
for (const [k, v] of infos) {
  wsL.getCell(l, 2).value = k;
  wsL.getCell(l, 2).font = { bold: true, size: 10 };
  wsL.getCell(l, 3).value = v;
  wsL.getCell(l, 3).alignment = { wrapText: true, vertical: "top" };
  wsL.getCell(l, 3).font = { size: 10 };
  l += 1;
}
l += 1;
wsL.getCell(l, 2).value = "Como usar";
wsL.getCell(l, 2).font = { bold: true, size: 11 };
l += 1;
const instrucoes = [
  "1. Aba Matriz: filtre por Domínio, Obrigação, Local ou Status. A coluna Status é sua ferramenta de implantação.",
  "2. Aba Prazos_SLA: o que o sistema precisa alertar antes de vencer.",
  "3. Aba Retencao: regras de guarda e descarte. Leia o alerta sobre a lei local.",
  "4. Aba Estrutura: pastas e códigos usados na coluna Local.",
  "5. Abas Lacunas e Decisoes: o que ainda precisa ser confirmado antes da Etapa 2.",
  "6. Aba Fontes: documentos e links que sustentam cada exigência.",
];
for (const t of instrucoes) {
  wsL.mergeCells(l, 2, l, 3);
  wsL.getCell(l, 2).value = t;
  wsL.getCell(l, 2).alignment = { wrapText: true, vertical: "top" };
  wsL.getCell(l, 2).font = { size: 10 };
  l += 1;
}
l += 1;
wsL.getCell(l, 2).value = "Legenda de obrigação";
wsL.getCell(l, 2).font = { bold: true, size: 11 };
l += 1;
for (const [k, v] of [
  ["Obrigatório", "Exigência direta da TI ou de lei aplicável."],
  ["Condicional", "Exigível apenas em situações específicas (gestante, menor, CXR anormal, tratamento)."],
  ["Recomendado", "Boa prática de desenho do sistema; não é exigência literal da TI."],
]) {
  wsL.getCell(l, 2).value = k;
  wsL.getCell(l, 2).font = { bold: true, size: 10, color: { argb: k === "Obrigatório" ? COR.vermelho : k === "Condicional" ? COR.ambar : COR.verde } };
  wsL.getCell(l, 3).value = v;
  wsL.getCell(l, 3).alignment = { wrapText: true };
  wsL.getCell(l, 3).font = { size: 10 };
  l += 1;
}

// --- Matriz
const ws = wb.addWorksheet("Matriz", {
  views: [{ state: "frozen", xSplit: 2, ySplit: 3 }],
  pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
});
const cols = [
  ["ID", 11], ["Domínio", 18], ["Requisito", 52], ["Fonte", 24], ["Obrigação", 12],
  ["Evidência a arquivar", 34], ["Responsável", 22], ["Local", 20], ["Retenção", 16],
  ["SOP", 10], ["Teste de auditoria", 38], ["Status", 16], ["Observações", 42],
];
ws.columns = cols.map(([h, w]) => ({ header: h, width: w, key: h }));
titulo(ws, `${meta.titulo} — v${meta.versao} (${dataBR}) — ${meta.status}`, cols.length);
cabecalho(ws, 3, cols.map((c) => c[0]));
ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: cols.length } };

requisitos.forEach((r, i) => {
  const row = ws.addRow([
    r.id, `${r.dom} — ${nomeDom(r.dom)}`, r.req, r.fonte, r.obr, r.evid, r.resp, r.local, r.ret, r.sop, r.teste, "", r.obs,
  ]);
  const banda = i % 2 === 1;
  row.eachCell((c) => {
    c.alignment = { vertical: "top", wrapText: true };
    c.font = { size: 9 };
    c.border = todas;
    if (banda) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.banda } };
  });
  row.getCell(1).font = { size: 9, bold: true };
  row.getCell(5).font = { size: 9, bold: true, color: { argb: r.obr === "Obrigatório" ? COR.vermelho : r.obr === "Condicional" ? COR.ambar : COR.verde } };
  row.getCell(8).font = { size: 8, name: "Consolas" };
  row.height = 48;
});
const ultima = ws.rowCount;
for (let i = 4; i <= ultima; i++) {
  ws.getCell(i, 12).dataValidation = {
    type: "list", allowBlank: true,
    formulae: ['"Não iniciado,Em andamento,Implantado,Validado,N/A"'],
    showErrorMessage: true, errorTitle: "Status inválido", error: "Escolha um valor da lista.",
  };
}

// --- SOPs
const wsS = wb.addWorksheet("SOPs", { views: [{ state: "frozen", ySplit: 3 }] });
wsS.columns = [{ width: 11 }, { width: 44 }, { width: 26 }, { width: 62 }, { width: 8 }, { width: 40 }];
titulo(wsS, "Índice de SOPs e requisitos cobertos", 6);
cabecalho(wsS, 3, ["SOP", "Título", "Dono", "Escopo", "Nº req.", "Requisitos cobertos"]);
sops.forEach((s, i) => {
  const ligados = requisitos.filter((r) => r.sop === s.id);
  const row = wsS.addRow([s.id, s.titulo, s.dono, s.escopo, ligados.length, ligados.map((r) => r.id).join(", ")]);
  row.eachCell((c) => { c.alignment = { vertical: "top", wrapText: true }; c.font = { size: 10 }; c.border = todas; if (i % 2) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.banda } }; });
  row.getCell(1).font = { size: 10, bold: true };
});

// --- Prazos
const wsP = wb.addWorksheet("Prazos_SLA", { views: [{ state: "frozen", ySplit: 3 }] });
wsP.columns = [{ width: 18 }, { width: 85 }, { width: 24 }];
titulo(wsP, "Prazos que o sistema precisa controlar", 3);
cabecalho(wsP, 3, ["Prazo", "O que vence", "Fonte"]);
prazos.forEach((p, i) => {
  const row = wsP.addRow([p.prazo, p.o_que, p.fonte]);
  row.eachCell((c) => { c.alignment = { vertical: "top", wrapText: true }; c.font = { size: 10 }; c.border = todas; if (i % 2) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.banda } }; });
  row.getCell(1).font = { size: 10, bold: true };
});

// --- Retenção
const wsR = wb.addWorksheet("Retencao", { views: [{ state: "frozen", ySplit: 3 }] });
wsR.columns = [{ width: 24 }, { width: 78 }, { width: 45 }];
titulo(wsR, "Regras de retenção", 3);
cabecalho(wsR, 3, ["Código", "Regra", "Exemplos"]);
retencaoRegras.forEach((r, i) => {
  const row = wsR.addRow([r.codigo, r.regra, r.exemplos]);
  row.eachCell((c) => { c.alignment = { vertical: "top", wrapText: true }; c.font = { size: 10 }; c.border = todas; if (i % 2) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.banda } }; });
  row.getCell(1).font = { size: 10, bold: true };
});
const avisoRet = wsR.addRow([
  "ATENÇÃO",
  "O mínimo britânico é 3 anos, mas a lei local pode exigir mais. No Brasil, o prontuário deve ser guardado por 20 anos (CFM 1.821/2007). Confirme a jurisdição antes de configurar o descarte.",
  "Ver RET-03 e L-11.",
]);
avisoRet.eachCell((c) => { c.alignment = { vertical: "top", wrapText: true }; c.font = { size: 10, bold: true, color: { argb: COR.vermelho } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF4ED" } }; });
avisoRet.height = 46;

// --- Estrutura
const wsE = wb.addWorksheet("Estrutura", { views: [{ state: "frozen", ySplit: 3 }] });
wsE.columns = [{ width: 26 }, { width: 48 }, { width: 75 }];
titulo(wsE, "Estrutura de arquivo — v1.0", 3);
cabecalho(wsE, 3, ["Código", "Caminho", "O que guarda"]);
estrutura.forEach((e, i) => {
  const row = wsE.addRow([e.codigo, e.caminho, e.desc]);
  row.eachCell((c) => { c.alignment = { vertical: "top", wrapText: true }; c.font = { size: 9 }; c.border = todas; if (i % 2) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.banda } }; });
  row.getCell(1).font = { size: 9, bold: true, name: "Consolas" };
  row.getCell(2).font = { size: 9, name: "Consolas" };
});

// --- Lacunas
const wsLa = wb.addWorksheet("Lacunas", { views: [{ state: "frozen", ySplit: 3 }] });
wsLa.columns = [{ width: 8 }, { width: 24 }, { width: 55 }, { width: 30 }, { width: 40 }];
titulo(wsLa, "Lacunas a confirmar com UKHSA/UKVI", 5);
cabecalho(wsLa, 3, ["ID", "Tema", "Pergunta", "Impacto", "Ação"]);
lacunas.forEach((x, i) => {
  const row = wsLa.addRow([x.id, x.tema, x.pergunta, x.impacto, x.acao]);
  row.eachCell((c) => { c.alignment = { vertical: "top", wrapText: true }; c.font = { size: 10 }; c.border = todas; if (i % 2) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.banda } }; });
  row.getCell(1).font = { size: 10, bold: true };
});

// --- Decisões
const wsD = wb.addWorksheet("Decisoes", { views: [{ state: "frozen", ySplit: 3 }] });
wsD.columns = [{ width: 8 }, { width: 30 }, { width: 38 }, { width: 62 }];
titulo(wsD, "Decisões necessárias para a Etapa 2", 4);
cabecalho(wsD, 3, ["ID", "Decisão", "Opções", "Recomendação e porquê"]);
decisoes.forEach((d, i) => {
  const row = wsD.addRow([d.id, d.decisao, d.opcoes, `${d.recomendacao} ${d.porque}`]);
  row.eachCell((c) => { c.alignment = { vertical: "top", wrapText: true }; c.font = { size: 10 }; c.border = todas; if (i % 2) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.banda } }; });
  row.getCell(1).font = { size: 10, bold: true };
});

// --- Fontes
const wsF = wb.addWorksheet("Fontes", { views: [{ state: "frozen", ySplit: 3 }] });
wsF.columns = [{ width: 46 }, { width: 34 }, { width: 24 }, { width: 60 }, { width: 14 }];
titulo(wsF, "Fontes normativas e referências", 5);
cabecalho(wsF, 3, ["Documento", "Órgão", "Data", "Uso", "Link"]);
fontes.forEach((f, i) => {
  const row = wsF.addRow([f.nome, f.orgao, f.data, f.uso, { text: "abrir", hyperlink: f.url }]);
  row.eachCell((c) => { c.alignment = { vertical: "top", wrapText: true }; c.font = { size: 10 }; c.border = todas; if (i % 2) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.banda } }; });
  row.getCell(5).font = { size: 10, color: { argb: "FF0569C1" }, underline: true };
});

await wb.xlsx.writeFile(path.join(destino, `${base}.xlsx`));

console.log(`OK — ${requisitos.length} requisitos`);
console.log(`  ${path.join(destino, base + ".md")}`);
console.log(`  ${path.join(destino, base + ".csv")}`);
console.log(`  ${path.join(destino, base + ".xlsx")}`);
