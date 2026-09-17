import { notFound } from "next/navigation";
import { createPublicSupabase } from "@/lib/supabase-server";
import { getCategorieen } from "@/lib/categorieen";
import { VakmanProfielClient } from "@/components/features/vakman/VakmanProfielClient";
import type { ReviewComplete, ProfessionalProfile } from "@/types";

// Geen cookies() in dit render-pad (zie createPublicSupabase) — dit
// maakt de pagina ISR-cachebaar i.p.v. bij elke aanvraag een verse
// (en op een rustige site regelmatig koude) serverless-aanroep te
// vereisen. Het inlog-afhankelijke deel (eigenaar-knoppen, "al
// gereviewd", stemstatus, buurt-badge) wordt client-side opgehaald via
// /api/vakman/persoonlijk — zie VakmanProfielClient.
export const revalidate = 300;

// Zonder generateStaticParams (ook al blijft de lijst hieronder leeg of
// onvolledig) blijft deze dynamische route in Next.js 14 altijd volledig
// dynamisch, ongeacht revalidate — dit is wat het daadwerkelijk activeert.
// Alle huidige provider-slugs alvast pre-renderen zodat ze direct na een
// nieuwe deploy al instant zijn i.p.v. pas na de allereerste bezoeker.
export async function generateStaticParams() {
  const supabase = createPublicSupabase();
  const { data } = await supabase.from("professional_profiles").select("slug");
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export default async function VakmanPage({ params }: { params: { slug: string } }) {
  const supabase = createPublicSupabase();

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!professional) notFound();

  const [{ data: eigenaarProfiel }, { data: reviews }, { data: beschikbaarheidRows }, alleCategorieen] = await Promise.all([
    supabase.from("profiles").select("deactivated_at, deleted_at").eq("id", professional.user_id).maybeSingle(),
    // author_name/author_avatar bewust niet opgehaald — deze pagina is
    // publiek, een review mag geen bewoner identificeerbaar maken.
    // "Buur" hieronder vervangt de echte naam voordat er ook maar iets
    // naar de client gaat.
    supabase
      .from("review_complete")
      .select(
        "id, author_id, professional_id, booking_id, community_id, text, scores, foto_urls, upvote_score, created_at, updated_at, reply_text, reply_date, reply_company, verified"
      )
      .eq("professional_id", professional.id)
      .order("upvote_score", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("availability").select("date, status").eq("professional_id", professional.id),
    getCategorieen(),
  ]);

  if (eigenaarProfiel?.deleted_at) notFound();

  const alleReviews = (reviews ?? []).map((r) => ({ ...r, author_name: "Buur", author_avatar: null })) as ReviewComplete[];
  const vakmanCategorieen = alleCategorieen.filter((c) => c.type === "professional");

  const beschikbaarheid: Record<string, "available" | "booked"> = {};
  (beschikbaarheidRows ?? []).forEach((r) => {
    beschikbaarheid[r.date] = r.status;
  });

  return (
    <VakmanProfielClient
      professional={professional as ProfessionalProfile}
      reviews={alleReviews}
      beschikbaarheid={beschikbaarheid}
      categories={vakmanCategorieen}
      isDeactivated={!!eigenaarProfiel?.deactivated_at}
    />
  );
}
