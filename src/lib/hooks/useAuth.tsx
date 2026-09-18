"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Expliciete kolomlijst i.p.v. select("*") — profiles.email/phone zijn
  // sinds de privacy-migratie (0061/0062) niet meer via een gewone select
  // leesbaar, ook niet voor je eigen rij; select("*") faalt daardoor nu
  // volledig i.p.v. de twee kolommen stilzwijgend weg te laten. Eigen
  // e-mail/telefoon komt apart binnen via get_my_contact_info().
  const PROFIEL_KOLOMMEN = "id, name, role, avatar_url, language, created_at, updated_at, deactivated_at, deleted_at";

  async function loadProfile(userId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select(PROFIEL_KOLOMMEN).eq("id", userId).maybeSingle();
    let profielData = data as Profile | null;

    // Gedeactiveerd account: opnieuw inloggen heractiveert automatisch,
    // geen aparte bevestigingsstap. Een verwijderd (geanonimiseerd)
    // account kan hier niet meer komen — dat is auth-side geband.
    if (profielData?.deactivated_at) {
      const { data: gereactiveerd } = await supabase
        .from("profiles")
        .update({ deactivated_at: null })
        .eq("id", userId)
        .select(PROFIEL_KOLOMMEN)
        .maybeSingle();
      if (gereactiveerd) profielData = gereactiveerd as Profile;
    }

    if (profielData) {
      const { data: contact } = await supabase.rpc("get_my_contact_info");
      const eigenContact = contact?.[0];
      profielData = { ...profielData, email: eigenContact?.email ?? null, phone: eigenContact?.phone ?? null };
    }

    setProfile(profielData);
  }

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth moet binnen AuthProvider gebruikt worden");
  return ctx;
}
