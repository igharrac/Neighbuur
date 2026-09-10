"use client";

import Link from "next/link";
import { Bell } from "@phosphor-icons/react";
import { useOngelezenNotificaties } from "@/lib/hooks/useOngelezenNotificaties";

export function NotificatieBadge() {
  const aantal = useOngelezenNotificaties();

  return (
    <Link
      href="/notificaties"
      aria-label={aantal > 0 ? `Notificaties, ${aantal} ongelezen` : "Notificaties"}
      className="relative min-w-11 min-h-11 flex items-center justify-center text-warmgrijs hover:text-warmzwart transition-colors"
    >
      <Bell size={22} />
      {aantal > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {aantal > 9 ? "9+" : aantal}
        </span>
      )}
    </Link>
  );
}
