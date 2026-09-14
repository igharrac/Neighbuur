import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email";

/**
 * Pauzeert een account (tijdelijk, zelf-herstelbaar): de eerstvolgende
 * succesvolle login zet deactivated_at automatisch weer op null (zie
 * useAuth.tsx's loadProfile). Server-route i.p.v. een directe client-
 * update omdat er ook een e-mail bij hoort — Resend werkt alleen
 * server-side.
 */
export async function POST() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { data: profiel, error: fetchError } = await supabase
    .from("profiles")
    .select("name, email, language")
    .eq("id", user.id)
    .maybeSingle();
  if (fetchError || !profiel) return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 });

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ deactivated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (profiel.email) {
    await sendEmail(profiel.email, (profiel.language as "nl" | "en") ?? "nl", {
      type: "account-gedeactiveerd",
      data: { naam: profiel.name, link: "/login" },
    });
  }

  return NextResponse.json({ ok: true });
}
