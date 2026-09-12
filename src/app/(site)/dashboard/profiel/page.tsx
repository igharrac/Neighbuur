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
    .from("professional_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vakman) redirect("/registreer/vakman");

  const { data: werkFotos } = await supabase
    .from("work_photos")
    .select("id, photo_url, caption")
    .eq("professional_id", vakman.id)
    .order("created_at", { ascending: true });

  const { data: beschikbaarheidRows } = await supabase
    .from("availability")
    .select("date, status")
    .eq("professional_id", vakman.id);

  const beschikbaarheid: Record<string, "available" | "booked"> = {};
  (beschikbaarheidRows ?? []).forEach((r) => {
    beschikbaarheid[r.date] = r.status;
  });

  return (
    <ProfielForm
      vakman={vakman as VakmanProfiel}
      werkFotos={werkFotos ?? []}
      beschikbaarheid={beschikbaarheid}
    />
  );
}
