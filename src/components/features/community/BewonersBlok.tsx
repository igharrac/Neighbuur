import { createServerSupabase } from "@/lib/supabase-server";
import { Avatar } from "@/components/ui/Avatar";

interface BewonersBlokData {
  toon_aantal?: boolean;
}

interface LidRow {
  user_id: string;
  profielen: { naam: string; avatar_url: string | null } | null;
}

const MAX_SHOWN = 24;

export async function BewonersBlok({ data, community_id }: { data: BewonersBlokData; community_id: string }) {
  const supabase = createServerSupabase();
  const { data: leden } = await supabase
    .from("community_leden")
    .select("user_id, profielen(naam, avatar_url)")
    .eq("community_id", community_id);

  const rows = (leden ?? []) as unknown as LidRow[];
  const shown = rows.slice(0, MAX_SHOWN);
  const rest = rows.length - shown.length;

  return (
    <div>
      <h3 className="font-display text-display-sm text-warmzwart mb-1">Bewoners</h3>
      {data.toon_aantal !== false && (
        <p className="text-body-sm text-warmgrijs mb-4">{rows.length} bewoners in deze community</p>
      )}
      {rows.length === 0 ? (
        <p className="text-body-sm text-warmgrijs">Nog geen bewoners aangesloten.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {shown.map((lid) => (
            <div key={lid.user_id} className="flex flex-col items-center gap-1.5 w-14">
              <Avatar naam={lid.profielen?.naam ?? "?"} src={lid.profielen?.avatar_url} size="md" />
              <span className="text-body-xs text-warmgrijs truncate w-full text-center">
                {lid.profielen?.naam?.split(" ")[0]}
              </span>
            </div>
          ))}
          {rest > 0 && (
            <div className="flex flex-col items-center gap-1.5 w-14">
              <span className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-body-xs font-bold text-warmgrijs">
                +{rest}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
