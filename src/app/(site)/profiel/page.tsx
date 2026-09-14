import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { ProfielForm } from "@/components/features/profiel/ProfielForm";
import type { Profile } from "@/types";

export default async function ProfielPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profiel) redirect("/login");

  let adres: string | null = null;
  if (profiel.role === "resident") {
    const { data: residentProfiel } = await supabase
      .from("resident_profiles")
      .select("current_residence_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (residentProfiel?.current_residence_id) {
      const { data: residence } = await supabase
        .from("residences")
        .select("address_id, construction_number")
        .eq("id", residentProfiel.current_residence_id)
        .maybeSingle();

      if (residence?.address_id) {
        const { data: address } = await supabase
          .from("addresses")
          .select("street, house_number, house_number_suffix, postal_code, city")
          .eq("id", residence.address_id)
          .maybeSingle();
        if (address) {
          adres = `${address.street ?? ""} ${address.house_number}${address.house_number_suffix ?? ""}, ${address.postal_code} ${address.city ?? ""}`.trim();
        }
      } else if (residence?.construction_number) {
        adres = `Bouwnummer ${residence.construction_number} (nog geen definitief adres)`;
      }
    }
  }

  return <ProfielForm profile={profiel as Profile} adres={adres} />;
}
