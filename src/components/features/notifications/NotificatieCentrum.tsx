"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useLang } from "@/lib/hooks/useLang";
import { NotificatieItem } from "@/components/features/notifications/NotificatieItem";
import type { Notificatie } from "@/types";

export function NotificatieCentrum({ initialNotificaties }: { initialNotificaties: Notificatie[] }) {
  const { dict } = useLang();
  const router = useRouter();
  const [notificaties, setNotificaties] = useState(initialNotificaties);

  const ongelezenAantal = notificaties.filter((n) => !n.gelezen).length;

  async function handleClick(notificatie: Notificatie) {
    if (!notificatie.gelezen) {
      setNotificaties((prev) => prev.map((n) => (n.id === notificatie.id ? { ...n, gelezen: true } : n)));
      const supabase = createClient();
      await supabase.from("notificaties").update({ gelezen: true }).eq("id", notificatie.id);
    }
    if (notificatie.link) router.push(notificatie.link);
  }

  async function handleMarkAllRead() {
    const ongelezenIds = notificaties.filter((n) => !n.gelezen).map((n) => n.id);
    if (ongelezenIds.length === 0) return;
    setNotificaties((prev) => prev.map((n) => ({ ...n, gelezen: true })));
    const supabase = createClient();
    await supabase.from("notificaties").update({ gelezen: true }).in("id", ongelezenIds);
  }

  if (notificaties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-sand text-warmgrijs flex items-center justify-center mx-auto mb-4">
          <Bell size={24} />
        </div>
        <h2 className="font-display text-body-lg font-bold text-warmzwart">{dict.notificaties.empty}</h2>
        <p className="text-body-sm text-warmgrijs mt-1">{dict.notificaties.emptySub}</p>
      </div>
    );
  }

  return (
    <div>
      {ongelezenAantal > 0 && (
        <div className="flex justify-end mb-2">
          <button onClick={handleMarkAllRead} className="text-body-sm font-semibold text-terracotta hover:underline">
            {dict.notificaties.markAllRead}
          </button>
        </div>
      )}
      <div className="card-flat divide-y divide-lijn !p-0 overflow-hidden">
        {notificaties.map((notificatie) => (
          <NotificatieItem key={notificatie.id} notificatie={notificatie} onClick={handleClick} />
        ))}
      </div>
    </div>
  );
}
