import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { notifyUser } from "@/lib/notify";
import type { BoekingStatus } from "@/types";

const GELDIGE_STATUSSEN: BoekingStatus[] = ["confirmed", "cancelled", "completed"];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const status = body?.status as BoekingStatus | undefined;
  if (!status || !GELDIGE_STATUSSEN.includes(status)) {
    return NextResponse.json({ error: "Ongeldige status" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  const { data: boeking } = await admin
    .from("bookings")
    .select("id, customer_id, professional_id, status, date, professional_profiles(user_id, company_name)")
    .eq("id", params.id)
    .maybeSingle();
  if (!boeking) return NextResponse.json({ error: "Boeking niet gevonden" }, { status: 404 });

  const vakmanProfiel = boeking.professional_profiles as unknown as { user_id: string; company_name: string } | null;
  const vakmanUserId = vakmanProfiel?.user_id;
  const bedrijfsnaam = vakmanProfiel?.company_name ?? "De vakman";

  const isKlant = boeking.customer_id === user.id;
  const isVakman = vakmanUserId === user.id;
  if (!isKlant && !isVakman) {
    return NextResponse.json({ error: "Geen toegang tot deze boeking" }, { status: 403 });
  }
  if (status === "confirmed" && !isVakman) {
    return NextResponse.json({ error: "Alleen de vakman kan een aanvraag accepteren" }, { status: 403 });
  }
  if (status === "completed" && boeking.status !== "confirmed") {
    return NextResponse.json({ error: "Alleen bevestigde boekingen kunnen afgerond worden" }, { status: 400 });
  }

  const { error: updateError } = await admin
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", boeking.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  const { data: klantProfiel } = await admin.from("profiles").select("name").eq("id", boeking.customer_id).maybeSingle();
  const klantNaam = klantProfiel?.name ?? "De klant";

  // "confirmed" gaat altijd naar de klant; bij "cancelled"/"completed" is de
  // ontvanger de partij die de actie niet zelf uitvoerde.
  const ontvangerId = status === "confirmed" ? boeking.customer_id : isVakman ? boeking.customer_id : vakmanUserId;
  const ontvangerIsVakman = status !== "confirmed" && isKlant;

  if (ontvangerId) {
    const teksten: Record<Exclude<BoekingStatus, "requested">, { titel_nl: string; titel_en: string; inhoud_nl: string; inhoud_en: string }> = {
      confirmed: {
        titel_nl: "Boeking bevestigd",
        titel_en: "Booking confirmed",
        inhoud_nl: `${bedrijfsnaam} heeft je boekingsaanvraag geaccepteerd.`,
        inhoud_en: `${bedrijfsnaam} accepted your booking request.`,
      },
      cancelled: {
        titel_nl: "Boeking geannuleerd",
        titel_en: "Booking cancelled",
        inhoud_nl: isVakman
          ? `${bedrijfsnaam} heeft je aanvraag helaas afgewezen.`
          : `${klantNaam} heeft de boeking geannuleerd.`,
        inhoud_en: isVakman ? `${bedrijfsnaam} declined your request.` : `${klantNaam} cancelled the booking.`,
      },
      completed: {
        titel_nl: "Klus afgerond",
        titel_en: "Job completed",
        inhoud_nl: `De klus met ${isVakman ? klantNaam : bedrijfsnaam} is gemarkeerd als afgerond.`,
        inhoud_en: `The job with ${isVakman ? klantNaam : bedrijfsnaam} was marked as completed.`,
      },
    };

    const tekst = teksten[status as Exclude<BoekingStatus, "requested">];
    const link = ontvangerIsVakman ? "/dashboard" : "/plan";
    const datumTekst = boeking.date
      ? new Date(boeking.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })
      : null;

    await notifyUser(admin, {
      userId: ontvangerId,
      type: "booking",
      titelNl: tekst.titel_nl,
      titelEn: tekst.titel_en,
      inhoudNl: tekst.inhoud_nl,
      inhoudEn: tekst.inhoud_en,
      link,
      email:
        status === "confirmed"
          ? { type: "boeking-bevestigd", data: { vakmanNaam: bedrijfsnaam, datumTekst, link } }
          : undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
