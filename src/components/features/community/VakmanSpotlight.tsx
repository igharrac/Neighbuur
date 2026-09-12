import Link from "next/link";
import { Star, ArrowRight, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { createServerSupabase } from "@/lib/supabase-server";
import { Avatar } from "@/components/ui/Avatar";

interface VakmanSpotlightData {
  vakman_id?: string;
}

interface VakmanRow {
  id: string;
  bedrijfsnaam: string;
  slug: string;
  logo_url: string | null;
  bio: string | null;
  geverifieerd: boolean;
  gem_score: number;
  review_count: number;
}

export async function VakmanSpotlight({ data }: { data: VakmanSpotlightData }) {
  if (!data.vakman_id) return null;

  const supabase = createServerSupabase();
  const { data: vakman } = await supabase
    .from("vakman_overzicht")
    .select("id, bedrijfsnaam, slug, logo_url, bio, geverifieerd, gem_score, review_count")
    .eq("id", data.vakman_id)
    .maybeSingle();

  if (!vakman) return null;
  const v: VakmanRow = {
    id: vakman.id!,
    bedrijfsnaam: vakman.bedrijfsnaam!,
    slug: vakman.slug!,
    logo_url: vakman.logo_url,
    bio: vakman.bio,
    geverifieerd: vakman.geverifieerd ?? false,
    gem_score: Number(vakman.gem_score ?? 0),
    review_count: Number(vakman.review_count ?? 0),
  };

  return (
    <div>
      <p className="text-body-xs font-semibold uppercase tracking-wider text-terracotta mb-3">Uitgelicht</p>
      <Link
        href={`/vakman/${v.slug}`}
        className="flex items-center gap-4 border border-lijn rounded-md p-4 no-underline transition-colors hover:border-terracotta group"
      >
        <Avatar naam={v.bedrijfsnaam} src={v.logo_url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-body text-warmzwart truncate">{v.bedrijfsnaam}</h4>
            {v.geverifieerd && <SealCheck size={16} weight="fill" className="text-groen shrink-0" />}
          </div>
          {v.bio && <p className="text-body-sm text-warmgrijs truncate">{v.bio}</p>}
          <div className="flex items-center gap-1 mt-1">
            <Star size={14} weight="fill" className="text-oker" />
            <span className="text-body-sm font-semibold">{v.gem_score.toFixed(1)}</span>
            <span className="text-body-xs text-warmgrijs">({v.review_count} reviews)</span>
          </div>
        </div>
        <ArrowRight size={18} className="text-lijn group-hover:text-terracotta transition-colors shrink-0" />
      </Link>
    </div>
  );
}
