"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import type { Message } from "@/types";

interface GesprekDetailProps {
  gesprekId: string;
  currentUserId: string;
  andereDeelnemer: { naam: string; avatar_url: string | null } | null;
  initialBerichten: Message[];
}

function datumLabel(iso: string): string {
  const datum = new Date(iso);
  const vandaag = new Date();
  const gisteren = new Date(vandaag);
  gisteren.setDate(vandaag.getDate() - 1);
  const zelfdeDag = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (zelfdeDag(datum, vandaag)) return "Vandaag";
  if (zelfdeDag(datum, gisteren)) return "Gisteren";
  return datum.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
}

export function GesprekDetail({ gesprekId, currentUserId, andereDeelnemer, initialBerichten }: GesprekDetailProps) {
  const { showToast } = useToast();
  const [berichten, setBerichten] = useState(initialBerichten);
  const [fotoUrls, setFotoUrls] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // De auth-sessie moet eerst geladen zijn (en het token naar de
    // realtime-client doorgezet), anders verbindt de websocket als
    // anonieme gebruiker en filtert RLS alle postgres_changes weg.
    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`gesprek-${gesprekId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${gesprekId}` },
          (payload) => {
            const nieuw = payload.new as Message;
            setBerichten((prev) => (prev.some((b) => b.id === nieuw.id) ? prev : [...prev, nieuw]));
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [gesprekId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten.length]);

  useEffect(() => {
    const ongelezenIds = berichten.filter((b) => b.sender_id !== currentUserId && !b.read_at).map((b) => b.id);
    if (ongelezenIds.length === 0) return;
    const supabase = createClient();
    supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", ongelezenIds).then();
  }, [berichten, currentUserId]);

  useEffect(() => {
    const nietOpgehaald = berichten.filter((b) => b.photo_url && !fotoUrls[b.photo_url]);
    if (nietOpgehaald.length === 0) return;
    const supabase = createClient();
    (async () => {
      const paren = await Promise.all(
        nietOpgehaald.map(async (b) => {
          const { data } = await supabase.storage.from("chat-fotos").createSignedUrl(b.photo_url!, 3600);
          return [b.photo_url!, data?.signedUrl ?? ""] as const;
        })
      );
      setFotoUrls((prev) => ({ ...prev, ...Object.fromEntries(paren) }));
    })();
  }, [berichten, fotoUrls]);

  async function handleSend({ tekst, fotoPath }: { tekst: string; fotoPath: string | null }): Promise<boolean> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: gesprekId, sender_id: currentUserId, text: tekst, photo_url: fotoPath })
      .select()
      .single();

    if (error || !data) {
      showToast("Bericht versturen is niet gelukt. Probeer het opnieuw.", "error");
      return false;
    }

    setBerichten((prev) => (prev.some((b) => b.id === data.id) ? prev : [...prev, data as Message]));
    return true;
  }

  let laatsteDatumLabel = "";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-cream">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-lijn bg-white pt-[calc(0.75rem+env(safe-area-inset-top))] shrink-0">
        <Link
          href="/berichten"
          className="min-w-11 min-h-11 flex items-center justify-center -ml-2 text-warmgrijs hover:text-warmzwart"
          aria-label="Terug naar berichten"
        >
          <ArrowLeft size={20} />
        </Link>
        <Avatar naam={andereDeelnemer?.naam ?? "?"} src={andereDeelnemer?.avatar_url} size="sm" />
        <span className="font-semibold text-body">{andereDeelnemer?.naam ?? "Onbekend"}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {berichten.length === 0 && (
          <p className="text-body-sm text-warmgrijs text-center mt-8">
            Nog geen berichten. Stuur de eerste!
          </p>
        )}
        {berichten.map((bericht) => {
          const label = datumLabel(bericht.created_at);
          const toonLabel = label !== laatsteDatumLabel;
          laatsteDatumLabel = label;
          return (
            <div key={bericht.id}>
              {toonLabel && <div className="text-center text-body-xs text-warmgrijs my-3">{label}</div>}
              <ChatBubble
                bericht={bericht}
                eigen={bericht.sender_id === currentUserId}
                fotoUrl={bericht.photo_url ? fotoUrls[bericht.photo_url] : undefined}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <ChatInput gesprekId={gesprekId} onSend={handleSend} />
    </div>
  );
}
