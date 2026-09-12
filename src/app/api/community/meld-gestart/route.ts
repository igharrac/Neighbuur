import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { notifyUser } from "@/lib/notify";

/**
 * Meldt de andere (automatisch meegekoppelde) leden van een net gestarte
 * community dat hun buren zijn begonnen. Wordt aangeroepen direct na een
 * succesvolle start_community()-RPC met aangemaakt=true — dus alleen bij een
 * daadwerkelijk nieuwe community, nooit bij het aansluiten bij een bestaande.
 */
export async function POST(request: Request) {
  const { communityId } = await request.json();
  if (!communityId) {
    return NextResponse.json({ error: "communityId is verplicht" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "niet ingelogd" }, { status: 401 });

  const admin = createAdminSupabase();
  const { data: community } = await admin.from("communities").select("naam, slug").eq("id", communityId).maybeSingle();
  if (!community) return NextResponse.json({ error: "community niet gevonden" }, { status: 404 });

  const { data: leden } = await admin.from("community_members").select("user_id").eq("community_id", communityId);
  const userIds = (leden ?? []).map((l) => l.user_id).filter((id) => id !== user.id);
  if (userIds.length === 0) return NextResponse.json({ verstuurd: 0 });

  const { data: voorkeuren } = await admin
    .from("resident_profiles")
    .select("user_id, show_community_suggestions")
    .in("user_id", userIds);
  const teMelden = (voorkeuren ?? []).filter((v) => v.show_community_suggestions).map((v) => v.user_id);

  let verstuurd = 0;
  for (const uid of teMelden) {
    await notifyUser(admin, {
      userId: uid,
      type: "systeem",
      titelNl: "Je buren zijn gestart!",
      titelEn: "Your neighbours have started!",
      inhoudNl: `Er is een community gestart voor jouw adres: ${community.naam}. Doe mee!`,
      inhoudEn: `A community has started for your address: ${community.naam}. Join in!`,
      link: `/community/${community.slug}`,
    });
    verstuurd++;
  }

  return NextResponse.json({ verstuurd });
}
