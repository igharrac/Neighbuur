import type { SupabaseClient } from "@supabase/supabase-js";

export interface ConversationPartner {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

/**
 * Voor een vakman tonen we in de chat de bedrijfsnaam + logo (waarmee
 * de bewoner het gesprek herkent) in plaats van hun persoonlijke naam.
 */
export async function resolveConversationPartner(
  admin: SupabaseClient,
  deelnemer: { user_id: string; profiles: { name: string; avatar_url: string | null; role: string } | null }
): Promise<ConversationPartner> {
  if (deelnemer.profiles?.role === "professional") {
    const { data: professional } = await admin
      .from("professional_profiles")
      .select("company_name, logo_url")
      .eq("user_id", deelnemer.user_id)
      .maybeSingle();
    if (professional) {
      return { user_id: deelnemer.user_id, name: professional.company_name, avatar_url: professional.logo_url };
    }
  }

  return {
    user_id: deelnemer.user_id,
    name: deelnemer.profiles?.name ?? "Onbekend",
    avatar_url: deelnemer.profiles?.avatar_url ?? null,
  };
}
