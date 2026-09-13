"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 50;

type Kind = "resident" | "professional";

interface DisplayRow {
  id: string;
  primary: string;
  secondary: string;
  createdAt: string;
  verified?: boolean;
}

/**
 * Doorzoekbare, gepagineerde accountlijst voor /admin/bewoners en
 * /admin/vakmensen. Gebruikt de GIN-trigram-indexen op profiles.name en
 * professional_profiles.company_name (migratie 0040) voor snelle
 * ILIKE-zoekopdrachten, ook bij honderdduizenden rijen.
 */
export function AdminAccountList({ kind }: { kind: Kind }) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debounced, verifiedOnly]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    async function load() {
      if (kind === "resident") {
        let query = supabase
          .from("profiles")
          .select("id, name, email, created_at", { count: "exact" })
          .eq("role", "resident");
        if (debounced) query = query.or(`name.ilike.%${debounced}%,email.ilike.%${debounced}%`);
        const { data, count: total } = await query.order("created_at", { ascending: false }).range(from, to);
        if (cancelled) return;
        setRows(
          (data ?? []).map((r) => ({
            id: r.id,
            primary: r.name,
            secondary: r.email ?? "—",
            createdAt: r.created_at ?? "",
          }))
        );
        setCount(total ?? 0);
      } else {
        let query = supabase
          .from("professional_profiles")
          .select("id, company_name, verified, created_at, profiles(name, email)", { count: "exact" });
        if (debounced) query = query.ilike("company_name", `%${debounced}%`);
        if (verifiedOnly) query = query.eq("verified", true);
        const { data, count: total } = await query.order("created_at", { ascending: false }).range(from, to);
        if (cancelled) return;
        setRows(
          (data ?? []).map((r) => ({
            id: r.id,
            primary: r.company_name,
            secondary: [r.profiles?.name, r.profiles?.email].filter(Boolean).join(" · ") || "—",
            createdAt: r.created_at ?? "",
            verified: r.verified ?? false,
          }))
        );
        setCount(total ?? 0);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [kind, debounced, page, verifiedOnly]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <Input
          placeholder={kind === "resident" ? "Zoek op naam of e-mail..." : "Zoek op bedrijfsnaam..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {kind === "professional" && (
          <label className="flex items-center gap-2 text-body-sm text-warmgrijs">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            Alleen geverifieerd
          </label>
        )}
        <span className="text-body-sm text-warmgrijs ml-auto">{count.toLocaleString("nl-NL")} resultaten</span>
      </div>

      <div className="card-flat divide-y divide-lijn">
        {loading && <p className="p-4 text-body-sm text-warmgrijs">Laden...</p>}
        {!loading && rows.length === 0 && <p className="p-4 text-body-sm text-warmgrijs">Geen resultaten.</p>}
        {!loading &&
          rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-semibold text-warmzwart">{row.primary}</p>
                <p className="text-body-sm text-warmgrijs">{row.secondary}</p>
              </div>
              <div className="flex items-center gap-3">
                {row.verified && <span className="badge badge-groen">Geverifieerd</span>}
                <p className="text-body-xs text-warmgrijs-dark">
                  sinds {row.createdAt ? new Date(row.createdAt).toLocaleDateString("nl-NL") : "—"}
                </p>
              </div>
            </div>
          ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-5">
          <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Vorige
          </Button>
          <span className="text-body-sm text-warmgrijs">
            Pagina {page + 1} van {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Volgende
          </Button>
        </div>
      )}
    </div>
  );
}
