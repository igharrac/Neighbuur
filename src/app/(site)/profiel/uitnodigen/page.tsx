import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { InviteCard } from "@/components/features/invite/InviteCard";

interface UitnodigingRow {
  used_at: string;
  profiles: { name: string } | null;
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
    .from("invitations")
    .select("used_at, profiles:used_by(name)")
    .eq("inviter_id", user.id)
    .not("used_by", "is", null)
    .order("used_at", { ascending: false });

  const genodigden = ((uitnodigingen ?? []) as unknown as UitnodigingRow[]).map((u) => ({
    naam: u.profiles?.name ?? "Iemand",
    datum: u.used_at,
  }));

  return (
    <div className="px-6 py-10">
      <InviteCard code={bewonerProfiel.uitnodigingscode} genodigden={genodigden} />
    </div>
  );
}
