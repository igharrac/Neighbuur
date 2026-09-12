import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Server-only client met de service role key. Omzeilt RLS — alleen
 * gebruiken in route handlers / server components voor operaties die
 * over gebruikers heen gaan (bv. een uitnodiging accepteren en de
 * uitnodiger een notificatie sturen). Nooit importeren in een
 * "use client" bestand — de key mag de browser nooit bereiken.
 */
export function createAdminSupabase() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
