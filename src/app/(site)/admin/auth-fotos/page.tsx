import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { AuthFotosEditor } from "@/components/admin/AuthFotosEditor";

export interface AuthPhotoRow {
  id: string;
  url: string;
  category: "resident" | "professional";
  active: boolean;
}

export default async function AdminAuthFotosPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const { data: fotos } = await supabase
    .from("auth_photos")
    .select("id, url, category, active")
    .order("created_at", { ascending: false });

  return <AuthFotosEditor initialPhotos={(fotos ?? []) as AuthPhotoRow[]} />;
}
