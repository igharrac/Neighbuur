/* eslint-disable @next/next/no-img-element */
import { Check, Checks } from "@phosphor-icons/react";
import type { Bericht } from "@/types";

interface ChatBubbleProps {
  bericht: Bericht;
  eigen: boolean;
  fotoUrl?: string;
}

export function ChatBubble({ bericht, eigen, fotoUrl }: ChatBubbleProps) {
  const tijd = new Date(bericht.created_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${eigen ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
          eigen ? "bg-terracotta text-white rounded-br-sm" : "bg-white border border-lijn text-warmzwart rounded-bl-sm"
        }`}
      >
        {bericht.foto_url && (
          <div className="w-48 max-w-full aspect-square rounded-lg mb-1.5 overflow-hidden bg-cream-dark">
            {fotoUrl ? (
              <img src={fotoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full animate-pulse" />
            )}
          </div>
        )}
        {bericht.tekst && <p className="text-body-sm whitespace-pre-wrap break-words">{bericht.tekst}</p>}
        <div className={`flex items-center gap-1 justify-end mt-1 text-body-xs ${eigen ? "text-white/70" : "text-warmgrijs"}`}>
          {tijd}
          {eigen && (bericht.gelezen_op ? <Checks size={14} weight="bold" /> : <Check size={14} />)}
        </div>
      </div>
    </div>
  );
}
