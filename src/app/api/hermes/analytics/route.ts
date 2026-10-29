import { NextResponse } from "next/server";
import { verifyHermesAuth } from "@/lib/hermes-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * Samenvatting voor Hermes' wekelijkse rapportage — geen ruwe rijen,
 * puur aantallen per event_name over de laatste N dagen, plus hoeveel
 * blogposts er in elke status staan. Hermes bouwt zelf het rapport; dit
 * endpoint levert alleen de cijfers die Neighbuur al heeft.
 */
export async function GET(request: Request) {
  const authError = verifyHermesAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const days = Math.min(Number(searchParams.get("days") ?? 7) || 7, 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminSupabase();

  const [{ data: events }, { data: posts }] = await Promise.all([
    admin.from("analytics_events").select("event_name").gte("created_at", since),
    admin.from("blog_posts").select("status"),
  ]);

  const eventCounts: Record<string, number> = {};
  for (const row of events ?? []) {
    eventCounts[row.event_name] = (eventCounts[row.event_name] ?? 0) + 1;
  }

  const postCounts: Record<string, number> = {};
  for (const row of posts ?? []) {
    postCounts[row.status] = (postCounts[row.status] ?? 0) + 1;
  }

  return NextResponse.json({
    period_days: days,
    since,
    event_counts: eventCounts,
    blog_post_counts: postCounts,
  });
}
