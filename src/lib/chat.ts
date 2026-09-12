import type { SupabaseClient } from "@supabase/supabase-js";

export interface GesprekPartner {
  user_id: string;
  naam: string;
  avatar_url: string | null;
}

/**
 * Voor een vakman tonen we in de chat de bedrijfsnaam + logo (waarmee
 * de bewoner het gesprek herkent) in plaats van hun persoonlijke naam.
 */
export async function resolveGesprekPartner(
  admin: SupabaseClient,
  deelnemer: { user_id: string; profiles: { name: string; avatar_url: string | null; role: string } | null }
): Promise<GesprekPartner> {
  if (deelnemer.profiles?.role === "professional") {
    const { data: vakman } = await admin
      .from("professional_profiles")
      .select("company_name, logo_url")
      .eq("user_id", deelnemer.user_id)
      .maybeSingle();
    if (vakman) {
      return { user_id: deelnemer.user_id, naam: vakman.company_name, avatar_url: vakman.logo_url };
    }
  }

  return {
    user_id: deelnemer.user_id,
    naam: deelnemer.profiles?.name ?? "Onbekend",
    avatar_url: deelnemer.profiles?.avatar_url ?? null,
  };
}
