import { cache } from "react";
import { redirect } from "next/navigation";
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
  user: { id: string } | null;
  profile: Profile | null;
}

/**
 * Cache curto do perfil por usuário.
 *
 * Cada navegação consultava auth (getUser, ida à rede) + profiles (outra ida).
 * O JWT já é validado localmente por getClaims(); o perfil muda raramente, então
 * guardamos por 30s. Segurança não depende disto: o RLS confere cargo e
 * "active" no banco a cada consulta.
 */
const PROFILE_TTL_MS = 30_000;
const profileCache = new Map<string, { profile: Profile | null; at: number }>();

export function invalidateProfileCache(userId?: string) {
  if (userId) profileCache.delete(userId);
  else profileCache.clear();
}

export const getSessionProfile = cache(async (): Promise<SessionProfile> => {
  if (!isSupabaseConfigured()) return { configured: false, user: null, profile: null };

  const supabase = await createServerSupabase();

  // getClaims() valida a assinatura do JWT com a chave pública local (JWKS em
  // cache), sem chamada ao servidor de auth em cada navegação.
  const { data, error } = await supabase.auth.getClaims();
  let userId = error ? null : (data?.claims?.sub ?? null);

  // Rede de segurança: se a verificação local falhar (ex.: JWKS indisponível),
  // confirma no servidor de auth para ninguém ficar travado fora do sistema.
  if (!userId && error) {
    const { data: fallback } = await supabase.auth.getUser();
    userId = fallback.user?.id ?? null;
  }
  if (!userId) return { configured: true, user: null, profile: null };

  const now = Date.now();
  const cached = profileCache.get(userId);
  if (cached && now - cached.at < PROFILE_TTL_MS) {
    return { configured: true, user: { id: userId }, profile: cached.profile };
  }

  const { data: row } = await supabase
    .from("profiles")
    .select("id, full_name, role, professional_registry, active")
    .eq("id", userId)
    .maybeSingle();

  const profile = (row as Profile | null) ?? null;
  profileCache.set(userId, { profile, at: now });

  return { configured: true, user: { id: userId }, profile };
});

export async function requireProfile(): Promise<{ user: { id: string }; profile: Profile }> {
  const session = await getSessionProfile();
  if (!session.configured) redirect("/entrar?setup=1");
  if (!session.user) redirect("/entrar");
  if (!session.profile || !session.profile.active) redirect("/entrar?erro=perfil");
  return { user: session.user, profile: session.profile };
}

export async function requireRole(roles: Role[]): Promise<{ user: { id: string }; profile: Profile }> {
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
