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
  },
};

export default nextConfig;
