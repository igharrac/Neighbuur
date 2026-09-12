import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { getOrCreateGesprek } from "@/lib/gesprekken";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const vakmanId = searchParams.get("vakman");
  if (!vakmanId) return NextResponse.redirect(`${origin}/`);

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const admin = createAdminSupabase();

  const { data: vakman } = await admin
    .from("professional_profiles")
    .select("id, user_id, slug")
    .eq("id", vakmanId)
    .maybeSingle();
  if (!vakman) return NextResponse.redirect(`${origin}/`);

  if (vakman.user_id === user.id) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  const gesprekId = await getOrCreateGesprek(admin, user.id, vakman.user_id);
  return NextResponse.redirect(`${origin}/berichten/${gesprekId}`);
}
