import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

/**
 * Verwijdert een account permanent — anonimiseert (zie
 * anonymize_and_ban_account, migratie 0048) i.p.v. hard te verwijderen,
 * en verandert daarna het e-mailadres op de auth-user naar iets
 * onherkenbaars + bant de sessie. Bewust geen auth.admin.deleteUser():
 * die zou proberen te cascaden naar profiles en direct op dezelfde
 * RESTRICT-constraints stuklopen als de RPC bewust omzeilt.
 *
 * Het e-mailadres wordt vervangen (i.p.v. alleen bannen) zodat het echte
 * adres weer vrij is voor een nieuwe, volledig losse registratie — zoals
 * op de meeste platforms. Simpelweg bannen zou dat adres voor altijd
 * blokkeren, ook voor een compleet nieuwe registratiepoging. De ban blijft
 * ernaast staan om lopende sessies/refresh-tokens van vóór de verwijdering
 * meteen ongeldig te maken.
 *
 * Volgorde is belangrijk: e-mailadres/naam ophalen en de bevestigingsmail
 * versturen vóórdat de RPC het adres wegschoont (notifyUser() zou het na
 * de schoning niet meer kunnen opzoeken, vandaar hier rechtstreeks
 * sendEmail() met de al-opgehaalde waarden). Auth wordt pas ná een
 * geslaagde RPC bijgewerkt, zodat een mislukte anonimisatie nooit een
 * geschoonde-maar-nog-inlogbare of juist afgesloten-maar-ongeschoonde
 * gebruiker achterlaat.
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

  const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
    email: `deleted-${user.id}@neighbuur.invalid`,
    ban_duration: "876000h",
  });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
