/* eslint-disable @next/next/no-img-element */
import { Check, Checks } from "@phosphor-icons/react";
import type { Message } from "@/types";

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  fotoUrl?: string;
}

export function ChatBubble({ message, isOwn, fotoUrl }: ChatBubbleProps) {
  const tijd = new Date(message.created_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
          isOwn ? "bg-sage text-white rounded-br-sm" : "bg-white border border-lijn text-warmzwart rounded-bl-sm"
        }`}
      >
        {message.photo_url && (
          <div className="w-48 max-w-full aspect-square rounded-lg mb-1.5 overflow-hidden bg-cream-dark">
            {fotoUrl ? (
              <img src={fotoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full animate-pulse" />
            )}
          </div>
        )}
        {message.text && <p className="text-body-sm whitespace-pre-wrap break-words">{message.text}</p>}
        <div className={`flex items-center gap-1 justify-end mt-1 text-body-xs ${isOwn ? "text-white/70" : "text-warmgrijs"}`}>
          {tijd}
          {isOwn && (message.read_at ? <Checks size={14} weight="bold" /> : <Check size={14} />)}
        </div>
      </div>
    </div>
  );
}
