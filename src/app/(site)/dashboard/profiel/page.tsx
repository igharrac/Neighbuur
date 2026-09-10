import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { ProfielForm } from "@/components/features/vakman/ProfielForm";
import type { VakmanProfiel } from "@/types";

export default async function DashboardProfielPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vakman } = await supabase
    .from("vakman_profielen")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vakman) redirect("/registreer/vakman");

  const { data: werkFotos } = await supabase
    .from("werk_fotos")
    .select("id, foto_url, bijschrift")
    .eq("vakman_id", vakman.id)
    .order("created_at", { ascending: true });

  const { data: beschikbaarheidRows } = await supabase
    .from("beschikbaarheid")
    .select("datum, status")
    .eq("vakman_id", vakman.id);

  const beschikbaarheid: Record<string, "beschikbaar" | "bezet"> = {};
  (beschikbaarheidRows ?? []).forEach((r) => {
    beschikbaarheid[r.datum] = r.status;
  });

  return (
    <ProfielForm
      vakman={vakman as VakmanProfiel}
      werkFotos={werkFotos ?? []}
      beschikbaarheid={beschikbaarheid}
    />
  );
}
