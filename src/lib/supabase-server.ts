import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Anon-client zonder cookies() — voor server components die statisch/ISR
 * gecached moeten kunnen worden. Next.js maakt een route automatisch
 * volledig dynamisch (nooit gecached) zodra `cookies()` ergens in het
 * render-pad wordt aangeroepen; deze client raakt cookies helemaal niet
 * aan. Alleen bruikbaar voor data die public_read is via RLS — er is
 * geen sessie, dus geen enkele auth-afhankelijke query werkt hiermee.
 */
export function createPublicSupabase() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}

export function createServerSupabase() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (e) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: "", ...options }); } catch (e) {}
        },
      },
    }
  );
}
