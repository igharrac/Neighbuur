import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { getOrCreateGesprek } from "@/lib/gesprekken";
import { notifyUser } from "@/lib/notify";

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
    .from("vakman_profielen")
    .select("id, user_id, bedrijfsnaam, aanvragen_deze_maand, aanvragen_limiet, is_premium")
    .eq("id", vakmanId)
    .maybeSingle();
  if (!vakman) return NextResponse.json({ error: "Vakman niet gevonden" }, { status: 404 });
  if (vakman.user_id === user.id) {
    return NextResponse.json({ error: "Je kan jezelf niet boeken" }, { status: 400 });
  }

  const { data: magAanvragen } = await admin.rpc("kan_boeking_aanvragen", { p_vakman_id: vakman.id });
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
  if (!vakman.is_premium && (vakman.aanvragen_deze_maand ?? 0) + 1 === vakman.aanvragen_limiet) {
    await notifyUser(admin, {
      userId: vakman.user_id,
      type: "premium",
      titelNl: "Gratis limiet bereikt",
      titelEn: "Free limit reached",
      inhoudNl: `Je hebt ${vakman.aanvragen_limiet}/${vakman.aanvragen_limiet} aanvragen gebruikt deze maand. Upgrade naar Pro voor onbeperkte aanvragen.`,
      inhoudEn: `You've used ${vakman.aanvragen_limiet}/${vakman.aanvragen_limiet} requests this month. Upgrade to Pro for unlimited requests.`,
      link: "/dashboard",
      push: false,
      email: { type: "premium-limiet", data: { limiet: vakman.aanvragen_limiet, link: "/dashboard" } },
    });
  }

  const { data: profiel } = await admin.from("profielen").select("naam").eq("id", user.id).maybeSingle();
  const klantNaam = profiel?.naam ?? "Een bewoner";

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

  const gesprekId = await getOrCreateGesprek(admin, user.id, vakman.user_id);

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
    type: "boeking",
    titelNl: "Nieuwe boekingsaanvraag",
    titelEn: "New booking request",
    inhoudNl: `${klantNaam} wil een klus bij je boeken.`,
    inhoudEn: `${klantNaam} wants to book a job with you.`,
    link: "/dashboard",
    email: { type: "boeking-aanvraag", data: { klantNaam, categorieNaam, link: "/dashboard" } },
  });

  return NextResponse.json({ boekingId: boeking.id, gesprekId });
}
