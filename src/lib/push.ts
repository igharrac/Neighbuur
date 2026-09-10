import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return;
  webpush.setVapidDetails("mailto:support@neighbuur.nl", publicKey, privateKey);
  configured = true;
}

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

/** Stuurt een web push naar alle geregistreerde devices van een gebruiker. Ruimt verlopen subscriptions op. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendPushToUser(admin: SupabaseClient<any>, userId: string, payload: PushPayload) {
  ensureConfigured();
  if (!configured) return;

  const { data: subscriptions } = await admin.from("push_subscriptions").select("id, subscription").eq("user_id", userId);
  if (!subscriptions || subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription as webpush.PushSubscription, JSON.stringify(payload));
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", row.id);
        } else {
          console.error("Push versturen mislukt:", err);
        }
      }
    })
  );
}
