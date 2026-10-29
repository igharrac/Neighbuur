import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { verifyHermesAuth } from "@/lib/hermes-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { slugify } from "@/lib/utils";

/**
 * Enige manier waarop Hermes content in Neighbuur krijgt. Komt altijd
 * binnen als status='draft' — nooit direct 'approved'/'published', dat
 * gebeurt alleen handmatig in /admin/content. body_html wordt hier
 * gesaniteerd, nooit vertrouwd als al veilig.
 */
export async function POST(request: Request) {
  const authError = verifyHermesAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const bodyHtmlRaw = String(body.body_html ?? "").trim();

  if (!title || !bodyHtmlRaw) {
    return NextResponse.json({ error: "title en body_html zijn verplicht" }, { status: 400 });
  }

  const bodyHtml = sanitizeHtml(bodyHtmlRaw, {
    allowedTags: ["p", "h2", "h3", "strong", "em", "a", "ul", "ol", "li", "blockquote", "br", "img"],
    allowedAttributes: { a: ["href", "rel", "target"], img: ["src", "alt"] },
  });

  const admin = createAdminSupabase();

  const baseSlug = body.slug ? slugify(String(body.slug)) : slugify(title);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await admin.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
  }

  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title,
      slug,
      excerpt: body.excerpt ? String(body.excerpt).trim() : null,
      body_html: bodyHtml,
      cover_image_url: body.cover_image_url ? String(body.cover_image_url) : null,
      seo_title: body.seo_title ? String(body.seo_title) : null,
      seo_description: body.seo_description ? String(body.seo_description) : null,
      scheduled_at: body.scheduled_at ? String(body.scheduled_at) : null,
      status: "draft",
      source: "hermes",
    })
    .select("id, slug, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: data }, { status: 201 });
}
