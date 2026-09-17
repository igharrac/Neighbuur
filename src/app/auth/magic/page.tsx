"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const LADEN = (
  <div className="min-h-screen flex items-center justify-center px-6">
    <p className="text-body text-warmgrijs">Bezig met inloggen…</p>
  </div>
);

/**
 * Bridge-pagina voor e-mail-inloglinks (signInWithOtp), die bewust de
 * implicit flow gebruiken (token in het URL-fragment, bv.
 * #access_token=...&refresh_token=...) i.p.v. PKCE — zie
 * createImplicitClient() in @/lib/supabase voor waarom. Zo'n fragment
 * is nooit zichtbaar voor de server (/auth/callback/route.ts handelt
 * alleen de PKCE ?code=-flow van Google-login af), dus dit is een
 * losse client-pagina die het fragment zelf uitleest en de sessie zet.
 *
 * useSearchParams() vereist een Suspense-boundary zodra de pagina
 * statisch geprerenderd kan worden (zie login/page.tsx voor toelichting).
 */
export default function MagicLoginPage() {
  return (
    <Suspense fallback={LADEN}>
      <MagicLoginPageInner />
    </Suspense>
  );
}

function MagicLoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const next = searchParams.get("next") || "/plan";

    if (!access_token || !refresh_token) {
      setFout("Geen geldige inlogtoken gevonden in de link.");
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) {
        setFout(error.message);
        return;
      }
      router.replace(next);
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <p className="text-body text-warmgrijs">{fout ?? "Bezig met inloggen…"}</p>
    </div>
  );
}
