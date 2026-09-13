import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { ProfielForm } from "@/components/features/vakman/ProfielForm";
import type { ProfessionalProfile } from "@/types";

export default async function DashboardProfielPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!professional) redirect("/registreer/vakman");

  const { data: werkFotos } = await supabase
    .from("work_photos")
    .select("id, photo_url, caption")
    .eq("professional_id", professional.id)
    .order("created_at", { ascending: true });

  const { data: beschikbaarheidRows } = await supabase
    .from("availability")
    .select("date, status")
    .eq("professional_id", professional.id);

  const beschikbaarheid: Record<string, "available" | "booked"> = {};
  (beschikbaarheidRows ?? []).forEach((r) => {
    beschikbaarheid[r.date] = r.status;
  });

  return (
    <ProfielForm
      professional={professional as ProfessionalProfile}
      werkFotos={werkFotos ?? []}
      beschikbaarheid={beschikbaarheid}
    />
  );
}
