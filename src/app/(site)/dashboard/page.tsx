import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { DashboardClient } from "@/components/features/vakman/DashboardClient";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import type { BoekingMetKlant, VakmanProfiel } from "@/types";

interface BoekingRow {
  id: string;
  klant_id: string;
  vakman_id: string;
  categorie_id: string | null;
  community_id: string | null;
  omschrijving: string | null;
  foto_urls: string[];
  datum: string | null;
  status: BoekingMetKlant["status"];
  prijs_cents: number | null;
  notities_klant: string | null;
  notities_vakman: string | null;
  created_at: string;
  updated_at: string;
  profielen: { naam: string; avatar_url: string | null } | null;
  communities: { naam: string } | null;
  categories: { name_nl: string } | null;
}

export default async function DashboardPage() {
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

  const { count: werkFotoCount } = await supabase
    .from("work_photos")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", vakman.id);

  const { count: beschikbaarheidCount } = await supabase
    .from("availability")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", vakman.id);

  const { data: boekingenData } = await supabase
    .from("boekingen")
    .select(
      `
      id, klant_id, vakman_id, categorie_id, community_id, omschrijving, foto_urls,
      datum, status, prijs_cents, notities_klant, notities_vakman, created_at, updated_at,
      profielen:klant_id(naam, avatar_url),
      communities(naam),
      categories(name_nl)
    `
    )
    .eq("vakman_id", vakman.id)
    .order("created_at", { ascending: false });

  const boekingen: BoekingMetKlant[] = ((boekingenData ?? []) as unknown as BoekingRow[]).map((b) => ({
    id: b.id,
    klant_id: b.klant_id,
    vakman_id: b.vakman_id,
    categorie_id: b.categorie_id,
    community_id: b.community_id,
    omschrijving: b.omschrijving,
    foto_urls: b.foto_urls,
    datum: b.datum,
    status: b.status,
    prijs_cents: b.prijs_cents,
    notities_klant: b.notities_klant,
    notities_vakman: b.notities_vakman,
    created_at: b.created_at,
    updated_at: b.updated_at,
    klant_naam: b.profielen?.naam ?? "Onbekend",
    klant_avatar: b.profielen?.avatar_url ?? null,
    community_naam: b.communities?.naam ?? null,
    categorie_naam: b.categories?.name_nl ?? null,
  }));

  // Gesprek-id per klant opzoeken, zodat de "Bericht"-knop op elke
  // aanvraagkaart direct naar het juiste gesprek linkt.
  const gesprekPerKlant: Record<string, string> = {};
  const klantIds = [...new Set(boekingen.map((b) => b.klant_id))];
  if (klantIds.length > 0) {
    const admin = createAdminSupabase();
    const { data: mijnGesprekken } = await admin.from("conversation_participants").select("conversation_id").eq("user_id", user.id);
    const mijnGesprekIds = (mijnGesprekken ?? []).map((g) => g.conversation_id as string);

    if (mijnGesprekIds.length > 0) {
      const { data: deelnames } = await admin
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", mijnGesprekIds)
        .in("user_id", klantIds);

      (deelnames ?? []).forEach((d) => {
        gesprekPerKlant[d.user_id as string] = d.conversation_id as string;
      });
    }
  }

  return (
    <PullToRefresh>
      <DashboardClient
        vakman={vakman as VakmanProfiel}
        werkFotoCount={werkFotoCount ?? 0}
        heeftBeschikbaarheid={(beschikbaarheidCount ?? 0) > 0}
        boekingen={boekingen}
        gesprekPerKlant={gesprekPerKlant}
      />
    </PullToRefresh>
  );
}
