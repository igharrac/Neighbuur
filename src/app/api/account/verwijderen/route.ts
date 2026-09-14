import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

/**
 * Verwijdert een account permanent — anonimiseert (zie
 * anonymize_and_ban_account, migratie 0048) i.p.v. hard te verwijderen,
 * en bant daarna de auth-user zodat inloggen nooit meer lukt. Bewust
 * geen auth.admin.deleteUser(): die zou proberen te cascaden naar
 * profiles en direct op dezelfde RESTRICT-constraints stuklopen als de
 * RPC bewust omzeilt.
 *
 * Volgorde is belangrijk: e-mailadres/naam ophalen en de bevestigingsmail
 * versturen vóórdat de RPC het adres wegschoont (notifyUser() zou het na
 * de schoning niet meer kunnen opzoeken, vandaar hier rechtstreeks
 * sendEmail() met de al-opgehaalde waarden). Banned wordt pas ná een
 * geslaagde RPC, zodat een mislukte anonimisatie nooit een gebande maar
 * ongeschoonde gebruiker achterlaat.
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

  if (profiel.email) {
    await sendEmail(profiel.email, (profiel.language as "nl" | "en") ?? "nl", {
      type: "account-verwijderd",
      data: { naam: profiel.name },
    });
  }

  const admin = createAdminSupabase();

  const { error: rpcError } = await admin.rpc("anonymize_and_ban_account", { p_user_id: user.id });
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  const { error: banError } = await admin.auth.admin.updateUserById(user.id, { ban_duration: "876000h" });
  if (banError) return NextResponse.json({ error: banError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
