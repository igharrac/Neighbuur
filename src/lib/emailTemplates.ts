type Lang = "nl" | "en";

interface EmailContent {
  subject: string;
  html: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://neighbuur.nl";

function layout(lang: Lang, title: string, body: string, ctaLabel: string, ctaUrl: string): string {
  return `
  <div style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;padding:32px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5E2DA;">
      <div style="background:#E8572A;padding:20px 28px;">
        <span style="font-family:Georgia,serif;font-weight:900;font-size:20px;color:#ffffff;">Neigh<span style="color:#1A1A18;">buur</span></span>
      </div>
      <div style="padding:28px;">
        <h1 style="font-family:Georgia,serif;font-size:20px;color:#1A1A18;margin:0 0 12px;">${title}</h1>
        <div style="font-size:14px;line-height:1.6;color:#1A1A18;">${body}</div>
        <a href="${ctaUrl}" style="display:inline-block;margin-top:24px;background:#E8572A;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:8px;">${ctaLabel}</a>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #E5E2DA;">
        <span style="font-size:11px;color:#8A877F;">${lang === "nl" ? "Je ontvangt dit omdat je een account hebt op Neighbuur." : "You're receiving this because you have a Neighbuur account."}</span>
      </div>
    </div>
  </div>`;
}

export function boekingAanvraagEmail(lang: Lang, data: { klantNaam: string; categorieNaam: string | null; link: string }): EmailContent {
  const url = `${APP_URL}${data.link}`;
  if (lang === "en") {
    return {
      subject: `New request from ${data.klantNaam}`,
      html: layout(
        "en",
        "New booking request",
        `<p>${data.klantNaam} wants to book${data.categorieNaam ? ` a ${data.categorieNaam} job` : " a job"} with you.</p>`,
        "View request",
        url
      ),
    };
  }
  return {
    subject: `Nieuwe aanvraag van ${data.klantNaam}`,
    html: layout(
      "nl",
      "Nieuwe boekingsaanvraag",
      `<p>${data.klantNaam} wil${data.categorieNaam ? ` een ${data.categorieNaam}-klus` : " een klus"} bij je boeken.</p>`,
      "Bekijk aanvraag",
      url
    ),
  };
}

export function boekingBevestigdEmail(lang: Lang, data: { vakmanNaam: string; datumTekst: string | null; link: string }): EmailContent {
  const url = `${APP_URL}${data.link}`;
  if (lang === "en") {
    return {
      subject: `${data.vakmanNaam} confirmed your booking`,
      html: layout(
        "en",
        "Booking confirmed",
        `<p>${data.vakmanNaam} accepted your booking request${data.datumTekst ? ` for ${data.datumTekst}` : ""}.</p>`,
        "View booking",
        url
      ),
    };
  }
  return {
    subject: `${data.vakmanNaam} heeft je boeking bevestigd`,
    html: layout(
      "nl",
      "Boeking bevestigd",
      `<p>${data.vakmanNaam} heeft je boekingsaanvraag geaccepteerd${data.datumTekst ? ` voor ${data.datumTekst}` : ""}.</p>`,
      "Bekijk boeking",
      url
    ),
  };
}

export function reviewVerzoekEmail(lang: Lang, data: { vakmanNaam: string; link: string }): EmailContent {
  const url = `${APP_URL}${data.link}`;
  if (lang === "en") {
    return {
      subject: `How was your experience with ${data.vakmanNaam}?`,
      html: layout(
        "en",
        "Share your experience",
        `<p>How was your experience with ${data.vakmanNaam}? Leave a review and help your neighbours choose.</p>`,
        "Write a review",
        url
      ),
    };
  }
  return {
    subject: `Hoe was je ervaring met ${data.vakmanNaam}?`,
    html: layout(
      "nl",
      "Deel je ervaring",
      `<p>Hoe was je ervaring met ${data.vakmanNaam}? Laat een review achter en help je buren kiezen.</p>`,
      "Review schrijven",
      url
    ),
  };
}

export function reviewOntvangenEmail(lang: Lang, data: { klantNaam: string; sterren: number; link: string }): EmailContent {
  const url = `${APP_URL}${data.link}`;
  if (lang === "en") {
    return {
      subject: `${data.klantNaam} left you a ${data.sterren}-star review`,
      html: layout(
        "en",
        "New review",
        `<p>${data.klantNaam} left a ${data.sterren}-star review about your work. Take a look and reply if you'd like.</p>`,
        "View review",
        url
      ),
    };
  }
  return {
    subject: `${data.klantNaam} heeft een review achtergelaten`,
    html: layout(
      "nl",
      "Nieuwe review",
      `<p>${data.klantNaam} heeft een review van ${data.sterren} sterren achtergelaten over jouw werk. Bekijk 'm en reageer als je wilt.</p>`,
      "Bekijk review",
      url
    ),
  };
}

export function uitnodigingGeaccepteerdEmail(lang: Lang, data: { naam: string; communityNaam: string; link: string }): EmailContent {
  const url = `${APP_URL}${data.link}`;
  if (lang === "en") {
    return {
      subject: `${data.naam} joined via your invite`,
      html: layout(
        "en",
        "Your invite was accepted",
        `<p>${data.naam} joined ${data.communityNaam} through your invite link. Thanks for helping Neighbuur grow in your neighbourhood!</p>`,
        "View neighbourhood",
        url
      ),
    };
  }
  return {
    subject: `${data.naam} is lid geworden via jouw link`,
    html: layout(
      "nl",
      "Je uitnodiging is geaccepteerd",
      `<p>${data.naam} is lid geworden van ${data.communityNaam} via jouw uitnodigingslink. Bedankt dat je Neighbuur helpt groeien in je wijk!</p>`,
      "Bekijk wijk",
      url
    ),
  };
}

export function premiumLimietEmail(lang: Lang, data: { limiet: number; link: string }): EmailContent {
  const url = `${APP_URL}${data.link}`;
  if (lang === "en") {
    return {
      subject: `You've used ${data.limiet}/${data.limiet} free requests this month`,
      html: layout(
        "en",
        "Free limit reached",
        `<p>You've used ${data.limiet}/${data.limiet} booking requests this month. Upgrade to Pro for unlimited requests.</p>`,
        "Upgrade to Pro",
        url
      ),
    };
  }
  return {
    subject: `Je hebt ${data.limiet}/${data.limiet} aanvragen gebruikt deze maand`,
    html: layout(
      "nl",
      "Gratis limiet bereikt",
      `<p>Je hebt ${data.limiet}/${data.limiet} boekingsaanvragen gebruikt deze maand. Upgrade naar Pro voor onbeperkte aanvragen.</p>`,
      "Upgrade naar Pro",
      url
    ),
  };
}
