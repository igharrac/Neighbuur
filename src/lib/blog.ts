import { createPublicSupabase } from "@/lib/supabase-server";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_html: string;
  cover_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string;
}

/** Alleen gepubliceerde posts, nieuwste eerst — gebruikt op /blog en in sitemap.ts. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, body_html, cover_image_url, seo_title, seo_description, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data as BlogPost[];
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, body_html, cover_image_url, seo_title, seo_description, published_at")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  return (data as BlogPost | null) ?? null;
}
