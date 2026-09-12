import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { notifyUser } from "@/lib/notify";

/**
 * Stuurt een review-verzoek naar de klant, 24u na het afronden van een
 * klus. Bedoeld om periodiek aangeroepen te worden door een externe
 * scheduler (bv. Vercel Cron) — zie vercel.json.
 */
export async function GET() {
  const admin = createAdminSupabase();
  const grens = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: boekingen, error } = await admin
    .from("bookings")
    .select("id, customer_id, updated_at, vakman_profielen(bedrijfsnaam, slug)")
    .eq("status", "afgerond")
    .is("review_request_sent_at", null)
    .lte("updated_at", grens);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let verstuurd = 0;
  for (const boeking of boekingen ?? []) {
    const vakman = boeking.vakman_profielen as unknown as { bedrijfsnaam: string; slug: string } | null;
    if (!vakman) continue;

    const link = `/vakman/${vakman.slug}?review=${boeking.id}`;
    await notifyUser(admin, {
      userId: boeking.customer_id,
      type: "review",
      titelNl: "Hoe was je ervaring?",
      titelEn: "How was your experience?",
      inhoudNl: `Laat een review achter voor ${vakman.bedrijfsnaam} en help je buren.`,
      inhoudEn: `Leave a review for ${vakman.bedrijfsnaam} and help your neighbours.`,
      link,
      email: { type: "review-verzoek", data: { vakmanNaam: vakman.bedrijfsnaam, link } },
    });

    await admin
      .from("bookings")
      .update({ review_request_sent_at: new Date().toISOString() })
      .eq("id", boeking.id);

    verstuurd++;
  }

  return NextResponse.json({ verstuurd });
}
