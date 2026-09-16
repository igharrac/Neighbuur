import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { getOrCreateConversation } from "@/lib/gesprekken";
import { notifyUser } from "@/lib/notify";
import { meldBehoefteBijDrempel } from "@/lib/demand";

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const vakmanId = body?.vakmanId as string | undefined;
  if (!vakmanId) return NextResponse.json({ error: "Vakman ontbreekt" }, { status: 400 });

  const admin = createAdminSupabase();

  const { data: vakman } = await admin
    .from("professional_profiles")
    .select("id, user_id, company_name, requests_this_month, requests_limit, is_premium")
    .eq("id", vakmanId)
    .maybeSingle();
  if (!vakman) return NextResponse.json({ error: "Vakman niet gevonden" }, { status: 404 });
  if (vakman.user_id === user.id) {
    return NextResponse.json({ error: "Je kan jezelf niet boeken" }, { status: 400 });
  }

  const { data: magAanvragen } = await admin.rpc("can_request_booking", { p_vakman_id: vakman.id });
  if (!magAanvragen) {
    return NextResponse.json(
      {
        error: "Deze vakman kan deze maand geen nieuwe boekingsaanvragen meer aannemen. Stuur gerust een bericht.",
        code: "limiet_bereikt",
      },
      { status: 409 }
    );
  }

  // Net over de limiet heen: eenmalig de vakman waarschuwen dat de gratis
  // aanvragen op zijn, i.p.v. bij elke volgende geblokkeerde poging.
  if (!vakman.is_premium && (vakman.requests_this_month ?? 0) + 1 === vakman.requests_limit) {
    await notifyUser(admin, {
      userId: vakman.user_id,
      type: "premium",
      titelNl: "Gratis limiet bereikt",
      titelEn: "Free limit reached",
      inhoudNl: `Je hebt ${vakman.requests_limit}/${vakman.requests_limit} aanvragen gebruikt deze maand. Upgrade naar Pro voor onbeperkte aanvragen.`,
      inhoudEn: `You've used ${vakman.requests_limit}/${vakman.requests_limit} requests this month. Upgrade to Pro for unlimited requests.`,
      link: "/dashboard",
      push: false,
      email: { type: "premium-limiet", data: { limiet: vakman.requests_limit, link: "/dashboard" } },
    });
  }

  const { data: profiel } = await admin.from("profiles").select("name").eq("id", user.id).maybeSingle();
  const klantNaam = profiel?.name ?? "Een bewoner";

  let categorieNaam: string | null = null;
  if (body?.categorieId) {
    const { data: categorie } = await admin.from("categories").select("name_nl").eq("id", body.categorieId).maybeSingle();
    categorieNaam = categorie?.name_nl ?? null;
  }

  const { data: boeking, error: boekingError } = await admin
    .from("bookings")
    .insert({
      customer_id: user.id,
      professional_id: vakman.id,
      category_id: body?.categorieId ?? null,
      community_id: body?.communityId ?? null,
      description: body?.omschrijving || null,
      foto_urls: body?.fotoUrls ?? [],
      date: body?.datum ?? null,
    })
    .select()
    .single();

  if (boekingError || !boeking) {
    return NextResponse.json({ error: boekingError?.message ?? "Aanvraag opslaan is niet gelukt" }, { status: 500 });
  }

  // Behoefte-clustering: alleen relevant als de klant een bevestigde
  // woning heeft binnen een cluster, en de boeking een categorie heeft.
  // Faalt bewust stil — een notificatieprobleem mag de boeking nooit
  // blokkeren, die is hierboven al succesvol opgeslagen.
  if (body?.categorieId) {
    try {
      const { data: bewonerProfiel } = await admin
        .from("resident_profiles")
        .select("current_residence_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (bewonerProfiel?.current_residence_id) {
        const { data: residence } = await admin
          .from("residences")
          .select("residential_cluster_id")
          .eq("id", bewonerProfiel.current_residence_id)
          .maybeSingle();
        if (residence?.residential_cluster_id) {
          await meldBehoefteBijDrempel(admin, { clusterId: residence.residential_cluster_id, categoryId: body.categorieId });
        }
      }
    } catch (err) {
      console.error("meldBehoefteBijDrempel mislukt:", err);
    }
  }

  const gesprekId = await getOrCreateConversation(admin, user.id, vakman.user_id);

  const datumTekst = body?.datum
    ? ` voor ${new Date(body.datum as string).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`
    : "";
  const samenvatting = [`Nieuwe boekingsaanvraag${datumTekst}.`, body?.omschrijving ? `"${body.omschrijving}"` : null]
    .filter(Boolean)
    .join(" ");

  await admin.from("messages").insert({
    conversation_id: gesprekId,
    sender_id: user.id,
    text: samenvatting,
  });

  await notifyUser(admin, {
    userId: vakman.user_id,
    type: "booking",
    titelNl: "Nieuwe boekingsaanvraag",
    titelEn: "New booking request",
    inhoudNl: `${klantNaam} wil een klus bij je boeken.`,
    inhoudEn: `${klantNaam} wants to book a job with you.`,
    link: "/dashboard",
    email: { type: "boeking-aanvraag", data: { klantNaam, categorieNaam, link: "/dashboard" } },
  });

  return NextResponse.json({ boekingId: boeking.id, gesprekId });
}
