import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { CategorieEditor } from "@/components/admin/CategorieEditor";
import type { Categorie } from "@/types";

export default async function AdminCategorieenPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const { data: categorieen } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return <CategorieEditor initialCategorieen={(categorieen ?? []) as Categorie[]} />;
}
