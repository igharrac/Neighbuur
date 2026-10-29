import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { verifyHermesAuth } from "@/lib/hermes-auth";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * Enige bron die Hermes voor onderwerp-/toonkeuzes raadpleegt: de
 * merkregels (inclusief de harde anti-verzinsel-regel) + de laatst
 * gepubliceerde/geplande titels, zodat Hermes niet per ongeluk hetzelfde
 * onderwerp dubbel oppakt.
 */
export async function GET(request: Request) {
  const authError = verifyHermesAuth(request);
  if (authError) return authError;

  const brandGuide = readFileSync(join(process.cwd(), "src/content/neighbuur-brand-guide.md"), "utf-8");

  const admin = createAdminSupabase();
  const { data: recentPosts } = await admin
    .from("blog_posts")
    .select("title, status, scheduled_at, published_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    brand_guide_markdown: brandGuide,
    recent_posts: recentPosts ?? [],
  });
}
