"use client";

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

interface DatumKiezerProps {
  beschikbaarheid: Record<string, "available" | "booked">;
  waarde: string | null;
  onChange: (datum: string) => void;
}

export function DatumKiezer({ beschikbaarheid, waarde, onChange }: DatumKiezerProps) {
  const dagen = buildDagen();
  const heeftBeschikbaarheid = dagen.some((d) => beschikbaarheid[toDateStr(d)] === "available");

  return (
    <div>
      <h3 className="font-display text-display-sm mb-1">Kies een datum</h3>
      <p className="text-body-sm text-warmgrijs mb-4">Beschikbaarheid van de vakman de komende 4 weken</p>

      {!heeftBeschikbaarheid ? (
        <p className="text-body-sm text-warmgrijs card-flat p-4">
          Deze vakman heeft nog geen beschikbaarheid doorgegeven. Je kan de aanvraag gewoon versturen — de datum stem je verder af via het gesprek.
        </p>
      ) : (
        <>
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
              const status = beschikbaarheid[key];
              const beschikbaar = status === "available";
              const geselecteerd = waarde === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!beschikbaar}
                  onClick={() => onChange(key)}
                  className={`aspect-square min-h-11 min-w-11 rounded-sm flex items-center justify-center text-body-sm font-medium transition-colors ${
                    geselecteerd
                      ? "bg-sage text-white"
                      : beschikbaar
                      ? "bg-groen-light text-groen hover:bg-groen hover:text-white cursor-pointer"
                      : "bg-cream-dark text-warmgrijs-light cursor-not-allowed"
                  }`}
                >
                  {dag.getDate()}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
