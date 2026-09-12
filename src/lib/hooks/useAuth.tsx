"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { Profiel } from "@/types";

interface AuthContextValue {
  user: User | null;
  profiel: Profiel | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfiel: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profiel, setProfiel] = useState<Profiel | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfiel(userId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfiel(data as Profiel | null);
  }

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfiel(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfiel(session.user.id);
      } else {
        setProfiel(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfiel(null);
  }

  async function refreshProfiel() {
    if (user) await loadProfiel(user.id);
  }

  return (
    <AuthContext.Provider value={{ user, profiel, loading, signOut, refreshProfiel }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth moet binnen AuthProvider gebruikt worden");
  return ctx;
}
