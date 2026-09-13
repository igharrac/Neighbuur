import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { AdminAccountList } from "@/components/admin/AdminAccountList";

export default async function AdminVakmensenPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-display-sm text-warmzwart mb-6">Vakmensen</h1>
      <AdminAccountList kind="professional" />
    </div>
  );
}
