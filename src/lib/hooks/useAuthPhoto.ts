"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const FALLBACK: Record<"resident" | "professional", string> = {
  resident: "/images/auth/resident-fallback.png",
  professional: "/images/auth/professional-fallback.jpg",
};

/** Kiest bij het laden willekeurig één actieve foto uit de auth_photos-pool voor de gegeven categorie. */
export function useAuthPhoto(category: "resident" | "professional"): string {
  const [url, setUrl] = useState(FALLBACK[category]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("auth_photos")
      .select("url")
      .eq("category", category)
      .eq("active", true)
      .then(({ data }) => {
        if (cancelled || !data || data.length === 0) return;
        const gekozen = data[Math.floor(Math.random() * data.length)];
        setUrl(gekozen.url);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return url;
}
