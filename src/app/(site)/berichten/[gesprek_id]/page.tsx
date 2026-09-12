import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { resolveGesprekPartner } from "@/lib/chat";
import { GesprekDetail } from "@/components/features/chat/GesprekDetail";
import type { Bericht } from "@/types";

export default async function GesprekPage({ params }: { params: { gesprek_id: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Leest bewust via de service-role client i.p.v. de RLS-gebonden
  // client: de bestaande "own_read"-policy op gesprek_deelnemers is
  // zelf-refererend en geeft "infinite recursion" (zie migratie
  // 0006). De autorisatie gebeurt hier alsnog expliciet in code.
  const admin = createAdminSupabase();

  const { data: deelnemers } = await admin
    .from("conversation_participants")
    .select("user_id, profiles(name, avatar_url, role)")
    .eq("conversation_id", params.gesprek_id);

  const eigenDeelname = (deelnemers ?? []).some((d) => d.user_id === user.id);
  if (!eigenDeelname) notFound();

  const andere = (deelnemers ?? []).find((d) => d.user_id !== user.id) as
    | { user_id: string; profiles: { name: string; avatar_url: string | null; role: string } | null }
    | undefined;

  const andereDeelnemer = andere ? await resolveGesprekPartner(admin, andere) : null;

  const { data: berichten } = await admin
    .from("messages")
    .select("*")
    .eq("conversation_id", params.gesprek_id)
    .order("created_at", { ascending: true });

  return (
    <GesprekDetail
      gesprekId={params.gesprek_id}
      currentUserId={user.id}
      andereDeelnemer={andereDeelnemer}
      initialBerichten={(berichten ?? []) as Bericht[]}
    />
  );
}
