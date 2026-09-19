import type { SupabaseClient } from "@supabase/supabase-js";

export interface ConversationPartner {
  user_id: string;
  name: string;
  avatar_url: string | null;
  /** Alleen gezet als de gesprekspartner een vakman is — voedt het infopaneel in GesprekDetail. */
  professional?: {
    slug: string;
    avg_score: number;
    review_count: number;
    verified: boolean;
    service_area_city: string | null;
    response_time_min: number | null;
  };
}

/**
 * Voor een vakman tonen we in de chat de bedrijfsnaam + logo (waarmee
 * de bewoner het gesprek herkent) in plaats van hun persoonlijke naam,
 * plus de reputatie-/verificatievelden die het infopaneel nodig heeft.
 */
export async function resolveConversationPartner(
  admin: SupabaseClient,
  deelnemer: { user_id: string; profiles: { name: string; avatar_url: string | null; role: string } | null }
): Promise<ConversationPartner> {
  if (deelnemer.profiles?.role === "professional") {
    const { data: professional } = await admin
      .from("professional_profiles")
      .select("company_name, logo_url, slug, avg_score, review_count, verified, service_area_city, response_time_min")
      .eq("user_id", deelnemer.user_id)
      .maybeSingle();
    if (professional) {
      return {
        user_id: deelnemer.user_id,
        name: professional.company_name,
        avatar_url: professional.logo_url,
        professional: {
          slug: professional.slug,
          avg_score: professional.avg_score,
          review_count: professional.review_count,
          verified: professional.verified,
          service_area_city: professional.service_area_city,
          response_time_min: professional.response_time_min,
        },
      };
    }
  }

  return {
    user_id: deelnemer.user_id,
    name: deelnemer.profiles?.name ?? "Onbekend",
    avatar_url: deelnemer.profiles?.avatar_url ?? null,
  };
}
