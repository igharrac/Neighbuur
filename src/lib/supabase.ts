import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Alleen voor het initiëren van signInWithOtp (e-mail-inloglink).
 * @supabase/ssr's createBrowserClient forceert intern altijd
 * flowType: "pkce" (niet overschrijfbaar via options) — PKCE bewaart
 * een code-verifier in de browser die de aanvraag start, wat niet
 * werkt als iemand de mail-link op een ander apparaat/browser opent
 * (een veelvoorkomend patroon). Daarom hier bewust de kale
 * @supabase/supabase-js-client met flowType "implicit": zelfstandige
 * tokens in de link zelf, werkt overal. Deze client wordt alleen
 * gebruikt om de aanvraag te doen — de sessie zelf wordt daarna via
 * de normale createClient() gezet (zie /auth/magic), zodat die wél
 * via cookies ook voor de server leesbaar is. Google-login blijft
 * bewust op de normale (PKCE) createClient() — daar zit geen "open de
 * link ergens anders"-stap tussen.
 */
export function createImplicitClient() {
  return createSupabaseJsClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: "implicit", persistSession: false } }
  );
}
