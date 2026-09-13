import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { DashboardClient } from "@/components/features/vakman/DashboardClient";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import type { BookingWithCustomer, ProfessionalProfile } from "@/types";

interface BoekingRow {
  id: string;
  customer_id: string;
  professional_id: string;
  category_id: string | null;
  community_id: string | null;
  description: string | null;
  foto_urls: string[];
  date: string | null;
  status: BookingWithCustomer["status"];
  price_cents: number | null;
  customer_notes: string | null;
  professional_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
  communities: { name: string } | null;
  categories: { name_nl: string } | null;
}

export default async function DashboardPage() {
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

  const { count: werkFotoCount } = await supabase
    .from("work_photos")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", professional.id);

  const { count: beschikbaarheidCount } = await supabase
    .from("availability")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", professional.id);

  const { data: boekingenData } = await supabase
    .from("bookings")
    .select(
      `
      id, customer_id, professional_id, category_id, community_id, description, foto_urls,
      date, status, price_cents, customer_notes, professional_notes, created_at, updated_at,
      profiles:customer_id(name, avatar_url),
      communities(name),
      categories(name_nl)
    `
    )
    .eq("professional_id", professional.id)
    .order("created_at", { ascending: false });

  const boekingen: BookingWithCustomer[] = ((boekingenData ?? []) as unknown as BoekingRow[]).map((b) => ({
    id: b.id,
    customer_id: b.customer_id,
    professional_id: b.professional_id,
    category_id: b.category_id,
    community_id: b.community_id,
    description: b.description,
    foto_urls: b.foto_urls,
    date: b.date,
    status: b.status,
    price_cents: b.price_cents,
    customer_notes: b.customer_notes,
    professional_notes: b.professional_notes,
    created_at: b.created_at,
    updated_at: b.updated_at,
    customer_name: b.profiles?.name ?? "Onbekend",
    customer_avatar: b.profiles?.avatar_url ?? null,
    community_name: b.communities?.name ?? null,
    category_name: b.categories?.name_nl ?? null,
  }));

  // Gesprek-id per klant opzoeken, zodat de "Bericht"-knop op elke
  // aanvraagkaart direct naar het juiste gesprek linkt.
  const gesprekPerKlant: Record<string, string> = {};
  const klantIds = [...new Set(boekingen.map((b) => b.customer_id))];
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
        professional={professional as ProfessionalProfile}
        werkFotoCount={werkFotoCount ?? 0}
        heeftBeschikbaarheid={(beschikbaarheidCount ?? 0) > 0}
        boekingen={boekingen}
        gesprekPerKlant={gesprekPerKlant}
      />
    </PullToRefresh>
  );
}
