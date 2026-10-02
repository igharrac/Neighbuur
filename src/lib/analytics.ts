import { createClient } from "@/lib/supabase";
import type { Json } from "@/types/database.types";

const SESSION_KEY = "nb_session_id";
const UTM_KEY = "nb_utm";

/** Lichtgewicht, zelf-gehoste event-tracking — geen externe analytics-vendor (zie plan). */
export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
}

function getSessionId(): string | null {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Leest UTM-parameters uit de huidige URL en bewaart ze voor de rest van de sessie (homepage → signup → confirmation). */
export function captureUtmParams(): UtmParams {
  const empty: UtmParams = { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null };
  try {
    const url = new URL(window.location.href);
    const fromUrl: UtmParams = {
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_content: url.searchParams.get("utm_content"),
    };
    if (fromUrl.utm_source || fromUrl.utm_medium || fromUrl.utm_campaign || fromUrl.utm_content) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const stored = sessionStorage.getItem(UTM_KEY);
    return stored ? (JSON.parse(stored) as UtmParams) : empty;
  } catch {
    return empty;
  }
}

/** Fire-and-forget event-log. Blokkeert de UI nooit — fouten worden stilletjes genegeerd. */
export function track(eventName: string, properties: Record<string, unknown> = {}): void {
  try {
    const utm = captureUtmParams();
    const supabase = createClient();
    void supabase.from("analytics_events").insert({
      event_name: eventName,
      properties: properties as Json,
      session_id: getSessionId(),
      path: window.location.pathname,
      lang: document.documentElement.lang || "nl",
      ...utm,
    });
  } catch {
    // telemetrie mag nooit de UI breken
  }
}
