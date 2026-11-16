import { gov } from "./requisitos-gov.mjs";
import { iden } from "./requisitos-id.mjs";
import { con } from "./requisitos-con.mjs";
import { cli } from "./requisitos-cli.mjs";
import { cxr } from "./requisitos-cxr.mjs";
import { lab } from "./requisitos-lab.mjs";
import { cert } from "./requisitos-cert.mjs";
import { ref } from "./requisitos-ref.mjs";
import { aud } from "./requisitos-aud.mjs";
import { dad } from "./requisitos-dad.mjs";
import { ret } from "./requisitos-ret.mjs";

const porDominio = { GOV: gov, ID: iden, CON: con, CLI: cli, CXR: cxr, LAB: lab, CERT: cert, REF: ref, AUD: aud, DAD: dad, RET: ret };

export const requisitos = Object.entries(porDominio).flatMap(([dom, lista]) =>
  lista.map((r) => ({ dom, ...r })),
);

export const requisitosPorDominio = porDominio;

export { meta, dominios, obrigacoes, retencaoRegras, prazos } from "./meta.mjs";
export { estrutura, mapeamento } from "./estrutura.mjs";
export { fontes } from "./fontes.mjs";
export { lacunas } from "./lacunas.mjs";
export { decisoes } from "./decisoes.mjs";
export { sops } from "./sops.mjs";
