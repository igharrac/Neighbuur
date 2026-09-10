import { Resend } from "resend";
import {
  boekingAanvraagEmail,
  boekingBevestigdEmail,
  reviewVerzoekEmail,
  reviewOntvangenEmail,
  uitnodigingGeaccepteerdEmail,
  premiumLimietEmail,
} from "@/lib/emailTemplates";

type Lang = "nl" | "en";

const AFZENDER = "Neighbuur <meldingen@neighbuur.nl>";

export type EmailTemplate =
  | { type: "boeking-aanvraag"; data: { klantNaam: string; categorieNaam: string | null; link: string } }
  | { type: "boeking-bevestigd"; data: { vakmanNaam: string; datumTekst: string | null; link: string } }
  | { type: "review-verzoek"; data: { vakmanNaam: string; link: string } }
  | { type: "review-ontvangen"; data: { klantNaam: string; sterren: number; link: string } }
  | { type: "uitnodiging-geaccepteerd"; data: { naam: string; communityNaam: string; link: string } }
  | { type: "premium-limiet"; data: { limiet: number; link: string } };

function render(lang: Lang, template: EmailTemplate) {
  switch (template.type) {
    case "boeking-aanvraag":
      return boekingAanvraagEmail(lang, template.data);
    case "boeking-bevestigd":
      return boekingBevestigdEmail(lang, template.data);
    case "review-verzoek":
      return reviewVerzoekEmail(lang, template.data);
    case "review-ontvangen":
      return reviewOntvangenEmail(lang, template.data);
    case "uitnodiging-geaccepteerd":
      return uitnodigingGeaccepteerdEmail(lang, template.data);
    case "premium-limiet":
      return premiumLimietEmail(lang, template.data);
  }
}

/** Verstuurt een transactionele e-mail via Resend. Faalt stil (gelogd) zodat een e-mailprobleem nooit de hoofdflow blokkeert. */
export async function sendEmail(to: string, lang: Lang, template: EmailTemplate) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxxx") return;

  try {
    const { subject, html } = render(lang, template);
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: AFZENDER, to, subject, html });
  } catch (err) {
    console.error("E-mail versturen mislukt:", err);
  }
}
