"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

type Status = "beschikbaar" | "bezet" | undefined;

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildDagen(): Date[] {
  const dagen: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 28; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dagen.push(d);
  }
  return dagen;
}

const DAG_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

export function BeschikbaarheidEditor({
  vakmanId,
  initialData,
}: {
  vakmanId: string;
  initialData: Record<string, "beschikbaar" | "bezet">;
}) {
  const [data, setData] = useState<Record<string, Status>>(initialData);
  const dagen = buildDagen();

  function nextStatus(current: Status): Status {
    if (current === undefined) return "beschikbaar";
    if (current === "beschikbaar") return "bezet";
    return undefined;
  }

  async function handleClick(datum: Date) {
    const key = toDateStr(datum);
    const next = nextStatus(data[key]);
    setData((d) => ({ ...d, [key]: next }));

    const supabase = createClient();
    if (next === undefined) {
      await supabase.from("beschikbaarheid").delete().eq("vakman_id", vakmanId).eq("datum", key);
    } else {
      await supabase
        .from("beschikbaarheid")
        .upsert({ vakman_id: vakmanId, datum: key, status: next }, { onConflict: "vakman_id,datum" });
    }
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {DAG_LABELS.map((label) => (
          <span key={label} className="text-center text-body-xs font-semibold text-warmgrijs uppercase">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {dagen.map((dag) => {
          const key = toDateStr(dag);
          const status = data[key];
          return (
            <button
              key={key}
              onClick={() => handleClick(dag)}
              className={`aspect-square min-h-11 min-w-11 rounded-md flex items-center justify-center text-body-sm font-medium transition-colors ${
                status === "beschikbaar"
                  ? "bg-groen text-white"
                  : status === "bezet"
                  ? "bg-cream-dark text-warmgrijs line-through"
                  : "bg-white border border-lijn text-warmzwart hover:border-terracotta"
              }`}
            >
              {dag.getDate()}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-body-xs text-warmgrijs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-groen" /> Beschikbaar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-cream-dark" /> Bezet
        </span>
      </div>
    </div>
  );
}
