import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem o selo flutuante "N" do Next.js sobre a interface (só existe em dev).
  devIndicators: false,
  experimental: {
    serverActions: {
      // Formulários clínicos são pequenos. Arquivos (DICOM/PDF) sobem
      // direto para o Supabase Storage com URL assinada, sem passar pela Vercel.
      bodySizeLimit: "2mb",
    },
    // Mantém no cache do navegador as telas já visitadas por alguns segundos:
    // voltar para uma aba já aberta fica instantâneo, sem esconder mudanças
    // feitas por outro usuário além desse intervalo. 30s é o equilíbrio:
    // navegação de ida e volta não espera o servidor, e dados clínicos ainda
    // ficam frescos. Ações (salvar) invalidam o cache na hora.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
