"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { nl } from "date-fns/locale";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import type { BlogPost, BlogPostStatus } from "@/types";

const STATUS_STYLE: Record<BlogPostStatus, { label: string; dot: string; badge: string }> = {
  draft: { label: "Concept", dot: "bg-warmgrijs", badge: "bg-sand text-warmgrijs-dark" },
  approved: { label: "Goedgekeurd", dot: "bg-oker", badge: "bg-oker-light text-oker" },
  published: { label: "Gepubliceerd", dot: "bg-groen", badge: "bg-groen-light text-groen-dark" },
};

/** Datum waarop een post in de kalender staat: beoogde planning, anders de echte publicatiedatum, anders de aanmaakdatum. */
function postDateKey(post: BlogPost): string {
  const d = post.scheduled_at ?? post.published_at ?? post.created_at;
  return format(parseISO(d), "yyyy-MM-dd");
}

export function ContentCalendar({ initialPosts }: { initialPosts: BlogPost[] }) {
  const { showToast } = useToast();
  const [posts, setPosts] = useState(initialPosts);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, BlogPost[]>();
    for (const post of posts) {
      const key = postDateKey(post);
      map.set(key, [...(map.get(key) ?? []), post]);
    }
    return map;
  }, [posts]);

  async function updateStatus(post: BlogPost, next: BlogPostStatus) {
    setSaving(true);
    const supabase = createClient();
    const patch: Partial<BlogPost> =
      next === "approved"
        ? { status: "approved", approved_at: new Date().toISOString() }
        : next === "published"
          ? { status: "published", published_at: new Date().toISOString() }
          : { status: "draft" };

    const { error } = await supabase.from("blog_posts").update(patch).eq("id", post.id);
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    const updated = { ...post, ...patch } as BlogPost;
    setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
    setSelected(updated);
    showToast(
      next === "approved" ? "Post goedgekeurd" : next === "published" ? "Post gepubliceerd" : "Terug naar concept",
      "success"
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-display-sm text-warmzwart capitalize">{format(month, "MMMM yyyy", { locale: nl })}</h1>
          <div className="flex gap-2">
            <button onClick={() => setMonth((m) => subMonths(m, 1))} className="btn-secondary !px-3 !py-1.5 !text-body-sm">
              ← Vorige
            </button>
            <button onClick={() => setMonth(startOfMonth(new Date()))} className="btn-secondary !px-3 !py-1.5 !text-body-sm">
              Vandaag
            </button>
            <button onClick={() => setMonth((m) => addMonths(m, 1))} className="btn-secondary !px-3 !py-1.5 !text-body-sm">
              Volgende →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-lijn border border-lijn rounded-sm overflow-hidden">
          {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((d) => (
            <div key={d} className="bg-sand-light px-2 py-1.5 text-body-xs font-semibold text-warmgrijs text-center">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayPosts = postsByDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={`bg-white min-h-[96px] p-1.5 ${!isSameMonth(day, month) ? "opacity-40" : ""}`}
              >
                <span className={`text-body-xs font-semibold ${isToday(day) ? "text-sage" : "text-warmgrijs"}`}>
                  {format(day, "d")}
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  {dayPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelected(post)}
                      className={`text-left text-body-xs leading-tight px-1.5 py-1 rounded-sm hover:bg-sand-light truncate ${
                        selected?.id === post.id ? "bg-sand-light" : ""
                      }`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${STATUS_STYLE[post.status].dot}`} />
                      {post.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-body-xs text-warmgrijs">
          {(Object.keys(STATUS_STYLE) as BlogPostStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${STATUS_STYLE[s].dot}`} />
              {STATUS_STYLE[s].label}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[320px] shrink-0">
        {selected ? (
          <div className="card-flat p-5 sticky top-6">
            <span className={`badge ${STATUS_STYLE[selected.status].badge} mb-3 inline-block`}>
              {STATUS_STYLE[selected.status].label}
            </span>
            <h2 className="font-display font-bold text-[18px] text-warmzwart mb-1.5">{selected.title}</h2>
            {selected.excerpt && <p className="text-body-sm text-warmgrijs mb-3">{selected.excerpt}</p>}
            <p className="text-body-xs text-warmgrijs mb-4">
              Bron: {selected.source === "hermes" ? "Hermes" : selected.source === "claude" ? "Claude" : "Handmatig"}
            </p>

            {Boolean(selected.quality_flags?.broken_links?.length) && (
              <div className="mb-4 p-3 rounded-sm bg-rood-light border border-rood text-body-xs text-rood-dark">
                <strong>Let op — mogelijk kapotte link(s):</strong>{" "}
                {selected.quality_flags.broken_links!.join(", ")} — deze pagina{selected.quality_flags.broken_links!.length > 1 ? "'s bestaan" : " bestaat"} niet in Neighbuur. Controleer vóór goedkeuring.
              </div>
            )}

            {/* Volledige inhoud, niet alleen de excerpt — goedkeuren zonder dit gezien te hebben mag niet kunnen. */}
            <div className="mb-4 max-h-[400px] overflow-y-auto border border-lijn rounded-sm p-3 bg-sand-light">
              {/* eslint-disable-next-line react/no-danger */}
              <div
                className="font-body text-body-sm leading-[22px] text-warmgrijs-dark [&>h2]:font-display [&>h2]:font-bold [&>h2]:text-[16px] [&>h2]:text-warmzwart [&>h2]:mt-4 [&>h2]:mb-2 [&>p]:mb-3 [&>a]:text-sage [&>a]:underline"
                dangerouslySetInnerHTML={{ __html: selected.body_html }}
              />
            </div>

            <div className="flex flex-col gap-2">
              {selected.status === "draft" && (
                <button
                  disabled={saving}
                  onClick={() => updateStatus(selected, "approved")}
                  className="btn-primary justify-center disabled:opacity-60"
                >
                  Goedkeuren
                </button>
              )}
              {selected.status === "approved" && (
                <button
                  disabled={saving}
                  onClick={() => updateStatus(selected, "published")}
                  className="btn-primary justify-center disabled:opacity-60"
                >
                  Publiceren
                </button>
              )}
              {selected.status === "published" && (
                <a href={`/blog/${selected.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary justify-center">
                  Bekijk live
                </a>
              )}
              {selected.status !== "draft" && (
                <button
                  disabled={saving}
                  onClick={() => updateStatus(selected, "draft")}
                  className="text-body-xs text-warmgrijs hover:text-warmzwart"
                >
                  Terugzetten naar concept
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="card-flat p-5 text-body-sm text-warmgrijs">Selecteer een post in de kalender om te bekijken of goed te keuren.</div>
        )}
      </div>
    </div>
  );
}
