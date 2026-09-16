import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { ConversationWithLastMessage } from "@/types";

export function GesprekkenLijst({ gesprekken }: { gesprekken: ConversationWithLastMessage[] }) {
  if (gesprekken.length === 0) {
    return <p className="text-body-sm text-warmgrijs px-6 py-4">Je hebt nog geen gesprekken.</p>;
  }

  return (
    <div className="flex flex-col">
      {gesprekken.map((g) => (
        <Link
          key={g.id}
          href={`/berichten/${g.id}`}
          className="flex items-center gap-3 px-6 py-4 border-b border-lijn hover:bg-sand/50 transition-colors no-underline min-h-11"
        >
          <Avatar naam={g.otherParticipant?.name ?? "?"} src={g.otherParticipant?.avatar_url} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-body-sm text-warmzwart truncate">
                {g.otherParticipant?.name ?? "Onbekend"}
              </span>
              {g.lastMessage && (
                <span className="text-body-xs text-warmgrijs shrink-0">
                  {new Date(g.lastMessage.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
            <p className={`text-body-sm truncate ${g.unreadCount > 0 ? "text-warmzwart font-medium" : "text-warmgrijs"}`}>
              {g.lastMessage ? g.lastMessage.text || "📷 Foto" : "Nog geen berichten"}
            </p>
          </div>
          {g.unreadCount > 0 && (
            <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-sage text-white text-body-xs font-bold flex items-center justify-center shrink-0">
              {g.unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
