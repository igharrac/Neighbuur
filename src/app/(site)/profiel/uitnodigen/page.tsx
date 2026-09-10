import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { InviteCard } from "@/components/features/invite/InviteCard";

interface UitnodigingRow {
  gebruikt_op: string;
  profielen: { naam: string } | null;
}

export default async function UitnodigenPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bewonerProfiel } = await supabase
    .from("bewoner_profielen")
    .select("uitnodigingscode")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!bewonerProfiel?.uitnodigingscode) {
    return (
      <div className="max-w-[520px] mx-auto px-6 py-16 text-center">
        <p className="text-body text-warmgrijs">
          Je moet eerst lid worden van een community voordat je buren kunt uitnodigen.
        </p>
      </div>
    );
  }

  const { data: uitnodigingen } = await supabase
    .from("uitnodigingen")
    .select("gebruikt_op, profielen:gebruikt_door(naam)")
    .eq("uitnodiger_id", user.id)
    .not("gebruikt_door", "is", null)
    .order("gebruikt_op", { ascending: false });

  const genodigden = ((uitnodigingen ?? []) as unknown as UitnodigingRow[]).map((u) => ({
    naam: u.profielen?.naam ?? "Iemand",
    datum: u.gebruikt_op,
  }));

  return (
    <div className="px-6 py-10">
      <InviteCard code={bewonerProfiel.uitnodigingscode} genodigden={genodigden} />
    </div>
  );
}
