import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Zoekt een bestaand 1-op-1 gesprek tussen twee gebruikers, of maakt er
 * een aan. Gebruikt de service-role client omdat het aanmaken van
 * conversation_participants voor de ANDERE partij niet via de RLS-gebonden
 * client kan (zie /berichten/nieuw en migratie 0006).
 */
export async function getOrCreateConversation(admin: SupabaseClient, userIdA: string, userIdB: string): Promise<string> {
  const { data: mijnGesprekken } = await admin.from("conversation_participants").select("conversation_id").eq("user_id", userIdA);
  const gesprekIds = (mijnGesprekken ?? []).map((g) => g.conversation_id as string);

  if (gesprekIds.length > 0) {
    const { data: gedeeld } = await admin
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userIdB)
      .in("conversation_id", gesprekIds)
      .maybeSingle();
    if (gedeeld) return gedeeld.conversation_id as string;
  }

  const { data: nieuwGesprek, error } = await admin.from("conversations").insert({}).select().single();
  if (error || !nieuwGesprek) throw error ?? new Error("Kon gesprek niet aanmaken");

  await admin.from("conversation_participants").insert([
    { conversation_id: nieuwGesprek.id, user_id: userIdA },
    { conversation_id: nieuwGesprek.id, user_id: userIdB },
  ]);

  return nieuwGesprek.id as string;
}
