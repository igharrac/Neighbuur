import { Megaphone } from "@phosphor-icons/react/dist/ssr";

interface AankondigingBlokData {
  titel?: string;
  inhoud?: string;
  kleur?: "sage" | "groen" | "blauw" | "oker";
}

const colorClass: Record<string, string> = {
  sage: "bg-sage-50 text-sage border-sage-200",
  groen: "bg-groen-light text-groen border-groen/20",
  blauw: "bg-blauw-light text-blauw border-blauw/20",
  oker: "bg-oker-light text-oker border-oker/20",
};

export function AankondigingBlok({ data }: { data: AankondigingBlokData }) {
  const kleur = data.kleur && colorClass[data.kleur] ? data.kleur : "sage";

  return (
    <div className={`rounded-md border p-5 flex gap-3.5 ${colorClass[kleur]}`}>
      <Megaphone size={22} weight="fill" className="shrink-0 mt-0.5" />
      <div>
        {data.titel && <h4 className="font-bold text-body mb-1">{data.titel}</h4>}
        {data.inhoud && <p className="text-body-sm leading-relaxed opacity-90 whitespace-pre-line">{data.inhoud}</p>}
      </div>
    </div>
  );
}
