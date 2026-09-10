import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { resolveGesprekPartner } from "@/lib/chat";
import { GesprekkenLijst } from "@/components/features/chat/GesprekkenLijst";
import type { GesprekMetLaatsteBericht } from "@/types";

interface DeelnemerRow {
  user_id: string;
  profielen: { naam: string; avatar_url: string | null; rol: string } | null;
}

interface BerichtRow {
  tekst: string;
  foto_url: string | null;
  created_at: string;
  van_id: string;
}

interface GesprekRow {
  id: string;
  created_at: string;
  gesprek_deelnemers: DeelnemerRow[];
  laatste_bericht: BerichtRow[] | BerichtRow | null;
}

export default async function BerichtenPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Leest bewust via de service-role client i.p.v. de RLS-gebonden
  // client: de bestaande "own_read"-policy op gesprek_deelnemers is
  // zelf-refererend en geeft "infinite recursion" (zie migratie
  // 0006). De scoping naar "mijn eigen gesprekken" gebeurt hier
  // alsnog expliciet in code, via mijnGesprekIds hieronder.
  const admin = createAdminSupabase();

  const { data: mijnDeelnames } = await admin.from("gesprek_deelnemers").select("gesprek_id").eq("user_id", user.id);
  const mijnGesprekIds = (mijnDeelnames ?? []).map((d) => d.gesprek_id);

  if (mijnGesprekIds.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto">
        <h1 className="font-display text-display-md px-6 pt-8 pb-4">Berichten</h1>
        <GesprekkenLijst gesprekken={[]} />
      </div>
    );
  }

  const { data: gesprekkenData } = await admin
    .from("gesprekken")
    .select(
      `
      id,
      created_at,
      gesprek_deelnemers(user_id, profielen(naam, avatar_url, rol)),
      laatste_bericht:berichten(tekst, foto_url, created_at, van_id)
    `
    )
    .in("id", mijnGesprekIds)
    .order("created_at", { ascending: false, foreignTable: "berichten" })
    .limit(1, { foreignTable: "berichten" })
    .order("created_at", { ascending: false });

  const { data: ongelezenRows } = await admin
    .from("berichten")
    .select("gesprek_id")
    .is("gelezen_op", null)
    .neq("van_id", user.id)
    .in("gesprek_id", mijnGesprekIds);

  const ongelezenPerGesprek = new Map<string, number>();
  (ongelezenRows ?? []).forEach((r) => {
    ongelezenPerGesprek.set(r.gesprek_id, (ongelezenPerGesprek.get(r.gesprek_id) ?? 0) + 1);
  });

  const tijdVoorSortering = (g: GesprekRow) => {
    const laatsteRaw = Array.isArray(g.laatste_bericht) ? g.laatste_bericht[0] : g.laatste_bericht;
    return new Date(laatsteRaw?.created_at ?? g.created_at).getTime();
  };

  const gesprekken: GesprekMetLaatsteBericht[] = await Promise.all(
    ((gesprekkenData ?? []) as unknown as GesprekRow[])
      .sort((a, b) => tijdVoorSortering(b) - tijdVoorSortering(a))
      .map(async (g) => {
        const andere = g.gesprek_deelnemers.find((d) => d.user_id !== user.id);
        const laatsteRaw = Array.isArray(g.laatste_bericht) ? g.laatste_bericht[0] : g.laatste_bericht;

        return {
          id: g.id,
          andereDeelnemer: andere ? await resolveGesprekPartner(admin, andere) : null,
          laatsteBericht: laatsteRaw
            ? { tekst: laatsteRaw.tekst, foto_url: laatsteRaw.foto_url, created_at: laatsteRaw.created_at, van_id: laatsteRaw.van_id }
            : null,
          ongelezenAantal: ongelezenPerGesprek.get(g.id) ?? 0,
        };
      })
  );

  return (
    <div className="max-w-[700px] mx-auto">
      <h1 className="font-display text-display-md px-6 pt-8 pb-4">Berichten</h1>
      <GesprekkenLijst gesprekken={gesprekken} />
    </div>
  );
}
