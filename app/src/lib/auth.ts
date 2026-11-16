import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServerSupabase, isSupabaseConfigured } from "./supabase/server";
import type { Profile, Role } from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  medico: "Panel Physician",
  radiologista: "Radiologista",
  secretaria: "Secretaria",
  enfermeiro: "Enfermagem",
  auditor: "Auditor",
};

interface SessionProfile {
  configured: boolean;
  user: User | null;
  profile: Profile | null;
}

export const getSessionProfile = cache(async (): Promise<SessionProfile> => {
  if (!isSupabaseConfigured()) return { configured: false, user: null, profile: null };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { configured: true, user: null, profile: null };

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, professional_registry, active")
    .eq("id", user.id)
    .maybeSingle();

  return { configured: true, user, profile: (data as Profile | null) ?? null };
});

export async function requireProfile(): Promise<{ user: User; profile: Profile }> {
  const session = await getSessionProfile();
  if (!session.configured) redirect("/entrar?setup=1");
  if (!session.user) redirect("/entrar");
  if (!session.profile || !session.profile.active) redirect("/entrar?erro=perfil");
  return { user: session.user, profile: session.profile };
}

export async function requireRole(roles: Role[]): Promise<{ user: User; profile: Profile }> {
  const session = await requireProfile();
  if (!roles.includes(session.profile.role)) redirect("/painel?erro=permissao");
  return session;
}

const WRITE_ROLES: Role[] = ["admin", "medico", "secretaria", "enfermeiro"];
const RADIOLOGY_ROLES: Role[] = ["admin", "medico", "radiologista", "enfermeiro"];

export function canWrite(role: Role, area: "clinical" | "radiology" | "certificate" | "audit"): boolean {
  if (area === "audit") return role === "admin" || role === "auditor";
  if (role === "auditor") return false;
  if (area === "certificate") return role === "admin" || role === "medico";
  if (area === "radiology") return RADIOLOGY_ROLES.includes(role);
  return WRITE_ROLES.includes(role);
}
