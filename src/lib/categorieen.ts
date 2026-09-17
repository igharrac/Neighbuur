import { createPublicSupabase } from "@/lib/supabase-server";
import { fallbackCategorieen } from "@/lib/categories-fallback";
import type { Category } from "@/types";

/**
 * Haalt actieve categorieën op uit Supabase, met fallback naar seed-data.
 * Bewust de cookie-vrije publieke client (categories is public_read,
 * auth maakt voor deze data toch geen verschil) — zodat pagina's die dit
 * aanroepen (o.a. vakman/[slug], ISR-gecached) niet alsnog door déze
 * aanroep gedwongen volledig dynamisch worden.
 */
export async function getCategorieen(): Promise<Category[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return fallbackCategorieen;
    return data as Category[];
  } catch {
    return fallbackCategorieen;
  }
}
