import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

/**
 * Verstuurt de welkomstmail na succesvolle vakman-registratie. Losse
 * route omdat RegistratieForm.tsx een client-component is en sendEmail()
 * de Resend-key nodig heeft, die alleen server-side mag draaien.
 * Fire-and-forget vanuit de client — sendEmail() faalt zelf al stil.
 */
export async function POST(request: Request) {
  const { email, lang, bedrijfsnaam, voornaam } = await request.json();
  if (!email || !bedrijfsnaam) {
    return NextResponse.json({ error: "Ontbrekende gegevens" }, { status: 400 });
  }

  await sendEmail(email, lang === "en" ? "en" : "nl", {
    type: "provider-welkom",
    data: { bedrijfsnaam, voornaam: voornaam || bedrijfsnaam },
  });

  return NextResponse.json({ ok: true });
}
