import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSessionProfile();
  if (!session.profile || !session.profile.active) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  const download = url.searchParams.get("download") === "1";

  if (!path) {
    return NextResponse.json({ error: "Parâmetro path obrigatório." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.storage
    .from("casos")
    .createSignedUrl(path, 120, download ? { download: true } : undefined);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? "Não foi possível gerar o link do arquivo." },
      { status: 404 },
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
