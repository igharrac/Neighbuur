import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { generateUitnodigingscode } from "@/lib/utils";
import { notifyUser } from "@/lib/notify";

export async function GET(request: Request, { params }: { params: { code: string } }) {
  const { code } = params;
  const { origin } = new URL(request.url);
  const admin = createAdminSupabase();

  // Zoek de uitnodiger via zijn persoonlijke code
  const { data: uitnodigerProfiel } = await admin
    .from("resident_profiles")
    .select("user_id, community_id, communities(slug)")
    .eq("invite_code", code)
    .maybeSingle();

  if (!uitnodigerProfiel || !uitnodigerProfiel.community_id) {
    return NextResponse.redirect(`${origin}/`);
  }

  const communitySlug = (uitnodigerProfiel.communities as unknown as { slug: string } | null)?.slug;

  // Is de bezoeker ingelogd?
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?invite=${code}`);
  }

  const { data: profiel } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profiel) {
    return NextResponse.redirect(`${origin}/onboarding?invite=${code}`);
  }

  // Jezelf uitnodigen via je eigen link doet niets bijzonders
  if (user.id === uitnodigerProfiel.user_id) {
    return NextResponse.redirect(`${origin}/community/${communitySlug}`);
  }

  // Voeg toe aan de community (idempotent)
  await admin
    .from("community_members")
    .upsert(
      { community_id: uitnodigerProfiel.community_id, user_id: user.id, role: "member" },
      { onConflict: "community_id,user_id", ignoreDuplicates: true }
    );

  // De nieuwe adres-eerst onboardingflow heeft de uitnodigde gebruiker al
  // een eigen resident_profiles-rij gegeven (met zijn eigen, echte adres/
  // residence) vóórdat die hier belandt — dit is dus alleen nog de
  // community-koppeling zelf, en een uitzonderingspad voor het geval er
  // (bv. via een oudere route) nog geen resident_profiles-rij bestaat.
  const { data: eigenBewonerProfiel } = await admin
    .from("resident_profiles")
    .select("id, community_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!eigenBewonerProfiel) {
    let eigenCode = generateUitnodigingscode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await admin
        .from("resident_profiles")
        .select("id")
        .eq("invite_code", eigenCode)
        .maybeSingle();
      if (!existing) break;
      eigenCode = generateUitnodigingscode();
    }

    await admin.from("resident_profiles").insert({
      user_id: user.id,
      community_id: uitnodigerProfiel.community_id,
      invite_code: eigenCode,
    });
  } else if (!eigenBewonerProfiel.community_id) {
    // Alleen zetten als de bewoner nog geen (eigen, organisch gedetecteerde)
    // community heeft — een uitnodiging overschrijft die nooit.
    await admin.from("resident_profiles").update({ community_id: uitnodigerProfiel.community_id }).eq("id", eigenBewonerProfiel.id);
  }

  // Log deze acceptatie + notificeer de uitnodiger (eenmalig per persoon)
  const { data: bestaandeLog } = await admin
    .from("invitations")
    .select("id")
    .eq("inviter_id", uitnodigerProfiel.user_id)
    .eq("used_by", user.id)
    .maybeSingle();

  if (!bestaandeLog) {
    await admin.from("invitations").insert({
      inviter_id: uitnodigerProfiel.user_id,
      code,
      community_id: uitnodigerProfiel.community_id,
      used_by: user.id,
      used_at: new Date().toISOString(),
    });

    const { data: nieuweGebruiker } = await admin.from("profiles").select("name").eq("id", user.id).maybeSingle();
    const naam = nieuweGebruiker?.name ?? "Iemand";

    await notifyUser(admin, {
      userId: uitnodigerProfiel.user_id,
      type: "invitation",
      titelNl: "Nieuwe buur via jouw link!",
      titelEn: "New neighbour via your link!",
      inhoudNl: `${naam} heeft zich aangemeld via jouw uitnodigingslink!`,
      inhoudEn: `${naam} signed up via your invite link!`,
      link: `/community/${communitySlug}`,
    });
  }

  return NextResponse.redirect(`${origin}/community/${communitySlug}`);
}
