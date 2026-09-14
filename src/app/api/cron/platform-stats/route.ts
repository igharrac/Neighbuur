import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * Schrijft één samenvattende rij per dag naar platform_stats_daily voor
 * het founder-dashboard. Draait 1x per dag (zie vercel.json) zodat het
 * dashboard nooit live hoeft te aggregeren over de volledige profiles/
 * bookings-tabellen — dat schaalt niet naar 1M bewoners / 150k vakmensen.
 * Upsert op snapshot_date, dus opnieuw draaien op dezelfde dag is veilig.
 */
export async function GET() {
  const admin = createAdminSupabase();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: residentCount },
    { count: professionalCount },
    { count: verifiedProfessionalCount },
    { data: communities },
    { count: bookingsTotal },
    { count: bookingsCompleted },
    { data: completedBookings },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "resident"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "professional"),
    admin
      .from("professional_profiles")
      .select("id", { count: "exact", head: true })
      .eq("verified", true),
    admin.from("communities").select("id, status"),
    admin.from("bookings").select("id", { count: "exact", head: true }),
    admin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "completed"),
    admin.from("bookings").select("price_cents").eq("status", "completed"),
  ]);

  const activeCommunityCount = communities?.filter((c) => c.status === "active").length ?? 0;
  const dormantCommunityCount = communities?.filter((c) => c.status === "dormant").length ?? 0;

  let avgMembersPerCommunity = 0;
  if (communities && communities.length > 0) {
    const { count: memberCount } = await admin
      .from("community_members")
      .select("user_id", { count: "exact", head: true });
    avgMembersPerCommunity = (memberCount ?? 0) / communities.length;
  }

  const revenueTotalCents = (completedBookings ?? []).reduce(
    (sum, b) => sum + (b.price_cents ?? 0),
    0
  );

  const { error } = await admin.from("platform_stats_daily").upsert(
    {
      snapshot_date: today,
      resident_count: residentCount ?? 0,
      professional_count: professionalCount ?? 0,
      verified_professional_count: verifiedProfessionalCount ?? 0,
      active_community_count: activeCommunityCount,
      dormant_community_count: dormantCommunityCount,
      avg_members_per_community: Number(avgMembersPerCommunity.toFixed(2)),
      bookings_total: bookingsTotal ?? 0,
      bookings_completed: bookingsCompleted ?? 0,
      revenue_total_cents: String(revenueTotalCents),
    },
    { onConflict: "snapshot_date" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ snapshot_date: today });
}
