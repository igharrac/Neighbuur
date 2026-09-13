import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { NotificatieCentrum } from "@/components/features/notifications/NotificatieCentrum";
import { PushOptIn } from "@/components/pwa/PushOptIn";
import type { Notificatie } from "@/types";

export default async function NotificatiesPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <div className="max-w-[700px] mx-auto px-6 pt-8 pb-8">
      <h1 className="font-display text-display-md mb-4">Notificaties</h1>
      <PushOptIn />
      <NotificatieCentrum initialNotificaties={(data ?? []) as Notificatie[]} />
    </div>
  );
}
