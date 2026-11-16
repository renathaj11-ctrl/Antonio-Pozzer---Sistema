"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { req, str } from "@/lib/form";

export async function entrar(formData: FormData) {
  const email = req(formData, "email");
  const password = req(formData, "password");
  const next = str(formData, "next") ?? "/painel";
  const target = next.startsWith("/") ? next : "/painel";

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/entrar?erro=${encodeURIComponent("E-mail ou senha inválidos.")}`);
  }

  revalidatePath("/", "layout");
  redirect(target);
}

export async function sair() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entrar");
}
