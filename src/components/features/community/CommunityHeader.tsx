"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UsersThree, Star, Tag, CheckCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

interface CommunityHeaderProps {
  naam: string;
  type: string;
  wijkNaam: string;
  wijkId: string;
  communityId: string;
  aantalLeden: number;
  aantalReviews: number;
  lopendeActies: number;
  initialIsMember: boolean;
}

export function CommunityHeader({
  naam,
  type,
  wijkNaam,
  wijkId,
  communityId,
  aantalLeden,
  aantalReviews,
  lopendeActies,
  initialIsMember,
}: CommunityHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [joining, setJoining] = useState(false);
  const [leden, setLeden] = useState(aantalLeden);

  async function handleJoin() {
    if (!user) {
      router.push("/login");
      return;
    }

    setJoining(true);
    const supabase = createClient();

    const { error: ledenError } = await supabase
      .from("community_leden")
      .insert({ community_id: communityId, user_id: user.id, rol: "lid" });

    if (ledenError) {
      setJoining(false);
      showToast(ledenError.message, "error");
      return;
    }

    await supabase
      .from("bewoner_profielen")
      .upsert({ user_id: user.id, community_id: communityId, wijk_id: wijkId }, { onConflict: "user_id" });

    setJoining(false);
    setIsMember(true);
    setLeden((n) => n + 1);
    showToast("Je bent lid geworden van deze community!", "success");
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-body-xs font-semibold uppercase tracking-wider text-terracotta mb-1">
            {type} · {wijkNaam}
          </p>
          <h1 className="font-display text-display-md text-warmzwart">{naam}</h1>
        </div>

        {isMember ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-groen-light text-groen text-body-sm font-semibold">
            <CheckCircle size={16} weight="fill" />
            Je bent lid
          </span>
        ) : (
          <button onClick={handleJoin} disabled={joining} className="btn-primary">
            {joining ? "Bezig..." : "Word lid"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5 mt-4 text-body-sm text-warmgrijs">
        <span className="flex items-center gap-1.5">
          <UsersThree size={16} />
          {leden} bewoners
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={16} />
          {aantalReviews} reviews
        </span>
        <span className="flex items-center gap-1.5">
          <Tag size={16} />
          {lopendeActies} acties
        </span>
      </div>
    </div>
  );
}
