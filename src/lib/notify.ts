import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificatieType } from "@/types";
import { sendPushToUser } from "@/lib/push";
import { sendEmail, type EmailTemplate } from "@/lib/email";

interface NotifyInput {
  userId: string;
  type: NotificatieType;
  titelNl: string;
  titelEn: string;
  inhoudNl?: string;
  inhoudEn?: string;
  link?: string;
  /** Web push versturen. Standaard aan. */
  push?: boolean;
  /** E-mailsjabloon versturen (taal wordt automatisch bepaald aan de hand van profiles.language). */
  email?: EmailTemplate;
}

/**
 * Eén aanroeppunt voor alle drie de notificatiekanalen (in-app, push, e-mail),
 * zodat elke trigger uit SPEC3 §7.2 consistent alle kanalen krijgt die er
 * voor dat event bij horen. Gebruikt de service-role admin-client omdat
 * ontvangers hun eigen notificaties-rij niet zelf mogen aanmaken.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function notifyUser(admin: SupabaseClient<any>, input: NotifyInput) {
  await admin.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title_nl: input.titelNl,
    title_en: input.titelEn,
    content_nl: input.inhoudNl ?? null,
    content_en: input.inhoudEn ?? null,
    link: input.link ?? null,
  });

  const wantsPush = input.push !== false;
  const wantsEmail = !!input.email;
  if (!wantsPush && !wantsEmail) return;

  const { data: profiel } = await admin.from("profiles").select("language, email").eq("id", input.userId).maybeSingle();
  const taal: "nl" | "en" = profiel?.language === "en" ? "en" : "nl";

  const tasks: Promise<unknown>[] = [];

  if (wantsPush) {
    tasks.push(
      sendPushToUser(admin, input.userId, {
        title: taal === "en" ? input.titelEn : input.titelNl,
        body: (taal === "en" ? input.inhoudEn : input.inhoudNl) ?? "",
        url: input.link ?? "/",
      })
    );
  }

  if (wantsEmail && profiel?.email) {
    tasks.push(sendEmail(profiel.email, taal, input.email as EmailTemplate));
  }

  await Promise.all(tasks);
}
