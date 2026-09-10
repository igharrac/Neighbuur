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
  deelnemer: { user_id: string; profielen: { naam: string; avatar_url: string | null; rol: string } | null }
): Promise<GesprekPartner> {
  if (deelnemer.profielen?.rol === "vakman") {
    const { data: vakman } = await admin
      .from("vakman_profielen")
      .select("bedrijfsnaam, logo_url")
      .eq("user_id", deelnemer.user_id)
      .maybeSingle();
    if (vakman) {
      return { user_id: deelnemer.user_id, naam: vakman.bedrijfsnaam, avatar_url: vakman.logo_url };
    }
  }

  return {
    user_id: deelnemer.user_id,
    naam: deelnemer.profielen?.naam ?? "Onbekend",
    avatar_url: deelnemer.profielen?.avatar_url ?? null,
  };
}
