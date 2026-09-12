import { createServerSupabase } from "@/lib/supabase-server";
import { fallbackCategorieen } from "@/lib/categories-fallback";
import type { Categorie } from "@/types";

/** Haalt actieve categorieën op uit Supabase, met fallback naar seed-data. */
export async function getCategorieen(): Promise<Categorie[]> {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return fallbackCategorieen;
    return data as Categorie[];
  } catch {
    return fallbackCategorieen;
  }
}
