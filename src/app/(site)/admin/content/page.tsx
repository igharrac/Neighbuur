import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { ContentCalendar } from "@/components/admin/ContentCalendar";
import type { BlogPost } from "@/types";

export default async function AdminContentPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profiel?.role !== "admin") redirect("/");

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return <ContentCalendar initialPosts={(posts ?? []) as BlogPost[]} />;
}
