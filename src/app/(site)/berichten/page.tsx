import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { resolveConversationPartner } from "@/lib/chat";
import { GesprekkenLijst } from "@/components/features/chat/GesprekkenLijst";
import type { ConversationWithLastMessage } from "@/types";

interface DeelnemerRow {
  user_id: string;
  profiles: { name: string; avatar_url: string | null; role: string } | null;
}

interface BerichtRow {
  text: string;
  photo_url: string | null;
  created_at: string;
  sender_id: string;
}

interface GesprekRow {
  id: string;
  created_at: string;
  conversation_participants: DeelnemerRow[];
  laatste_bericht: BerichtRow[] | BerichtRow | null;
}

export default async function BerichtenPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Leest bewust via de service-role client i.p.v. de RLS-gebonden
  // client: de bestaande "own_read"-policy op conversation_participants is
  // zelf-refererend en geeft "infinite recursion" (zie migratie
  // 0006). De scoping naar "mijn eigen gesprekken" gebeurt hier
  // alsnog expliciet in code, via mijnGesprekIds hieronder.
  const admin = createAdminSupabase();

  const { data: mijnDeelnames } = await admin.from("conversation_participants").select("conversation_id").eq("user_id", user.id);
  const mijnGesprekIds = (mijnDeelnames ?? []).map((d) => d.conversation_id);

  if (mijnGesprekIds.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto">
        <h1 className="font-display text-display-md px-6 pt-8 pb-4">Berichten</h1>
        <GesprekkenLijst gesprekken={[]} />
      </div>
    );
  }

  const { data: gesprekkenData } = await admin
    .from("conversations")
    .select(
      `
      id,
      created_at,
      conversation_participants(user_id, profiles(name, avatar_url, role)),
      laatste_bericht:messages(text, photo_url, created_at, sender_id)
    `
    )
    .in("id", mijnGesprekIds)
    .order("created_at", { ascending: false, foreignTable: "messages" })
    .limit(1, { foreignTable: "messages" })
    .order("created_at", { ascending: false });

  const { data: ongelezenRows } = await admin
    .from("messages")
    .select("conversation_id")
    .is("read_at", null)
    .neq("sender_id", user.id)
    .in("conversation_id", mijnGesprekIds);

  const ongelezenPerGesprek = new Map<string, number>();
  (ongelezenRows ?? []).forEach((r) => {
    ongelezenPerGesprek.set(r.conversation_id, (ongelezenPerGesprek.get(r.conversation_id) ?? 0) + 1);
  });

  const tijdVoorSortering = (g: GesprekRow) => {
    const laatsteRaw = Array.isArray(g.laatste_bericht) ? g.laatste_bericht[0] : g.laatste_bericht;
    return new Date(laatsteRaw?.created_at ?? g.created_at).getTime();
  };

  const gesprekken: ConversationWithLastMessage[] = await Promise.all(
    ((gesprekkenData ?? []) as unknown as GesprekRow[])
      .sort((a, b) => tijdVoorSortering(b) - tijdVoorSortering(a))
      .map(async (g) => {
        const andere = g.conversation_participants.find((d) => d.user_id !== user.id);
        const laatsteRaw = Array.isArray(g.laatste_bericht) ? g.laatste_bericht[0] : g.laatste_bericht;

        return {
          id: g.id,
          otherParticipant: andere ? await resolveConversationPartner(admin, andere) : null,
          lastMessage: laatsteRaw
            ? { text: laatsteRaw.text, foto_url: laatsteRaw.photo_url, created_at: laatsteRaw.created_at, sender_id: laatsteRaw.sender_id }
            : null,
          unreadCount: ongelezenPerGesprek.get(g.id) ?? 0,
        };
      })
  );

  return (
    <div className="max-w-[700px] mx-auto">
      <h1 className="font-display text-display-md px-6 pt-8 pb-4">Berichten</h1>
      <GesprekkenLijst gesprekken={gesprekken} />
    </div>
  );
}
