"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "./useAuth";

/** Aantal ongelezen notificaties van de huidige gebruiker, opnieuw opgehaald bij elke navigatie. */
export function useOngelezenNotificaties(): number {
  const { user } = useAuth();
  const pathname = usePathname();
  const [aantal, setAantal] = useState(0);

  useEffect(() => {
    if (!user) {
      setAantal(0);
      return;
    }
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false)
      .then(({ count }) => setAantal(count ?? 0));
  }, [user, pathname]);

  return aantal;
}
