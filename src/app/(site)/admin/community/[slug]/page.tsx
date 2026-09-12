import { redirect, notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { CommunityEditorClient } from "@/components/admin/CommunityEditorClient";
import type { CommunityContentBlok } from "@/types";

export default async function AdminCommunityPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: community } = await supabase
    .from("communities")
    .select("id, naam, slug")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!community) notFound();

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  let geautoriseerd = profiel?.role === "admin";
  if (!geautoriseerd) {
    const { data: lid } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .maybeSingle();
    geautoriseerd = lid?.role === "beheerder";
  }

  if (!geautoriseerd) redirect("/");

  const { data: blokken } = await supabase
    .from("community_content_blokken")
    .select("id, community_id, type, positie, data, actief")
    .eq("community_id", community.id)
    .eq("actief", true)
    .order("positie", { ascending: true });

  return (
    <CommunityEditorClient
      communityId={community.id}
      communityNaam={community.naam}
      initialBlocks={(blokken ?? []) as CommunityContentBlok[]}
    />
  );
}
