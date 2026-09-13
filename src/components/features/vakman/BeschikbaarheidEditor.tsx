"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

type Status = "available" | "booked" | undefined;

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
  professionalId,
  initialData,
}: {
  professionalId: string;
  initialData: Record<string, "available" | "booked">;
}) {
  const [data, setData] = useState<Record<string, Status>>(initialData);
  const dagen = buildDagen();

  function nextStatus(current: Status): Status {
    if (current === undefined) return "available";
    if (current === "available") return "booked";
    return undefined;
  }

  async function handleClick(datum: Date) {
    const key = toDateStr(datum);
    const next = nextStatus(data[key]);
    setData((d) => ({ ...d, [key]: next }));

    const supabase = createClient();
    if (next === undefined) {
      await supabase.from("availability").delete().eq("professional_id", professionalId).eq("date", key);
    } else {
      await supabase
        .from("availability")
        .upsert({ professional_id: professionalId, date: key, status: next }, { onConflict: "professional_id,date" });
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
                status === "available"
                  ? "bg-groen text-white"
                  : status === "booked"
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
