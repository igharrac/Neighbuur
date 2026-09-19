"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MapPin,
  SealCheck,
  ShieldCheck,
  Lightbulb,
  Lightning,
  Image as ImageIcon,
  CalendarCheck,
  CaretRight,
  X,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { ChatBubble } from "./ChatBubble";
import { ChatInput, type ChatInputHandle } from "./ChatInput";
import type { ConversationPartner } from "@/lib/chat";
import type { Message } from "@/types";

interface GesprekDetailProps {
  conversationId: string;
  currentUserId: string;
  otherParticipant: ConversationPartner | null;
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

export function GesprekDetail({ conversationId, currentUserId, otherParticipant, initialBerichten }: GesprekDetailProps) {
  const { showToast } = useToast();
  const [berichten, setBerichten] = useState(initialBerichten);
  const [fotoUrls, setFotoUrls] = useState<Record<string, string>>({});
  const [tipZichtbaar, setTipZichtbaar] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  const vakman = otherParticipant?.professional;

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
        .channel(`gesprek-${conversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
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
  }, [conversationId]);

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
      .insert({ conversation_id: conversationId, sender_id: currentUserId, text: tekst, photo_url: fotoPath })
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

  // "Online" bestaat bewust niet — er is geen presence-systeem. De
  // responstijd tonen we alleen als 'm daadwerkelijk gezet is (het veld
  // bestaat in de database maar wordt vandaag nergens ingevuld); geen
  // verzonnen status erbij fantaseren.
  const statusLine = vakman?.response_time_min ? `Reageert meestal binnen ${vakman.response_time_min} minuten` : null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 lg:py-8">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/berichten"
          className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-warmgrijs hover:text-warmzwart no-underline"
        >
          <ArrowLeft size={16} weight="bold" />
          Terug naar berichten
        </Link>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-groen">
          <ShieldCheck size={16} weight="fill" />
          Veilig en betrouwbaar
        </span>
      </div>

      <div className={`grid grid-cols-1 ${vakman ? "lg:grid-cols-3" : ""} gap-6 items-start`}>
        <div
          className={`${vakman ? "lg:col-span-2" : ""} bg-white rounded border-2 border-warmzwart shadow-[3px_3px_0_0_#1A1A18] overflow-hidden flex flex-col h-[calc(100vh-230px)] min-h-[460px]`}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-lijn shrink-0">
            <Avatar naam={otherParticipant?.name ?? "?"} src={otherParticipant?.avatar_url} size="sm" />
            <div className="min-w-0">
              <p className="font-semibold text-body truncate">{otherParticipant?.name ?? "Onbekend"}</p>
              {statusLine && (
                <p className="text-body-xs text-warmgrijs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-groen shrink-0" />
                  {statusLine}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {berichten.length === 0 && (
              <p className="text-body-sm text-warmgrijs text-center mt-8">Nog geen berichten. Stuur de eerste!</p>
            )}
            {berichten.map((bericht) => {
              const label = datumLabel(bericht.created_at);
              const toonLabel = label !== laatsteDatumLabel;
              laatsteDatumLabel = label;
              return (
                <div key={bericht.id}>
                  {toonLabel && <div className="text-center text-body-xs text-warmgrijs my-3">{label}</div>}
                  <ChatBubble
                    message={bericht}
                    isOwn={bericht.sender_id === currentUserId}
                    fotoUrl={bericht.photo_url ? fotoUrls[bericht.photo_url] : undefined}
                  />
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <ChatInput ref={chatInputRef} conversationId={conversationId} onSend={handleSend} />
        </div>

        {vakman && (
          <aside className="flex flex-col gap-4">
            <div className="bg-white rounded border-2 border-warmzwart shadow-[3px_3px_0_0_#1A1A18] p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar naam={otherParticipant.name} src={otherParticipant.avatar_url} size="md" />
                <p className="font-display font-bold text-body text-warmzwart min-w-0 truncate">{otherParticipant.name}</p>
              </div>
              {vakman.review_count > 0 && (
                <p className="flex items-center gap-1.5 text-body-sm mb-2">
                  <Star size={15} weight="fill" className="text-oker shrink-0" />
                  <span className="font-semibold text-warmzwart">{vakman.avg_score.toFixed(1)}</span>
                  <span className="text-warmgrijs">({vakman.review_count} reviews)</span>
                </p>
              )}
              {vakman.service_area_city && (
                <p className="flex items-center gap-1.5 text-body-sm text-warmgrijs mb-2">
                  <MapPin size={15} className="shrink-0" />
                  {vakman.service_area_city}
                </p>
              )}
              {vakman.verified && (
                <p className="flex items-center gap-1.5 text-body-sm text-groen font-semibold mb-4">
                  <SealCheck size={15} weight="fill" className="shrink-0" />
                  Geverifieerd vakman
                </p>
              )}
              <Link href={`/vakman/${vakman.slug}`} className="btn-secondary w-full justify-center !text-body-sm no-underline">
                Bekijk profiel
              </Link>
            </div>

            {tipZichtbaar && (
              <div className="relative bg-sage-50 border border-sage-100 rounded p-4">
                <button
                  onClick={() => setTipZichtbaar(false)}
                  aria-label="Tip verbergen"
                  className="absolute top-3 right-3 text-warmgrijs hover:text-warmzwart"
                >
                  <X size={15} />
                </button>
                <p className="flex items-center gap-1.5 font-semibold text-body-sm text-sage mb-1">
                  <Lightbulb size={16} weight="fill" />
                  Tip
                </p>
                <p className="text-body-sm text-warmgrijs-dark pr-5">
                  Deel foto&apos;s van je situatie voor een sneller en beter advies.
                </p>
              </div>
            )}

            <div className="bg-white rounded border-2 border-warmzwart shadow-[3px_3px_0_0_#1A1A18] p-2">
              <p className="flex items-center gap-1.5 font-semibold text-body-sm text-warmzwart px-3 py-2">
                <Lightning size={15} weight="fill" className="text-sage" />
                Snelle acties
              </p>
              <button
                onClick={() => chatInputRef.current?.openPhotoPicker()}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-sand transition-colors text-body-sm text-warmzwart"
              >
                <span className="flex items-center gap-2">
                  <ImageIcon size={16} />
                  Foto&apos;s toevoegen
                </span>
                <CaretRight size={14} className="text-warmgrijs" />
              </button>
              <Link
                href={`/vakman/${vakman.slug}`}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-sand transition-colors text-body-sm text-warmzwart no-underline"
              >
                <span className="flex items-center gap-2">
                  <CalendarCheck size={16} />
                  Bekijk profiel &amp; boek
                </span>
                <CaretRight size={14} className="text-warmgrijs" />
              </Link>
            </div>

            <div className="bg-lavendel-light rounded p-4">
              <p className="flex items-center gap-1.5 font-semibold text-body-sm text-lavendel mb-1">
                <ShieldCheck size={16} weight="fill" />
                Veilig en betrouwbaar
              </p>
              <p className="text-body-sm text-warmgrijs-dark">Je chat met een geverifieerde vakman via Neighbuur.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
