"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UsersThree, Star, Tag, CheckCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

interface CommunityHeaderProps {
  name: string;
  type: string;
  developmentName: string | null;
  developmentId: string | null;
  communityId: string;
  memberCount: number;
  reviewCount: number;
  activeDeals: number;
  initialIsMember: boolean;
}

export function CommunityHeader({
  name,
  type,
  developmentName,
  developmentId,
  communityId,
  memberCount,
  reviewCount,
  activeDeals,
  initialIsMember,
}: CommunityHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [joining, setJoining] = useState(false);
  const [leden, setLeden] = useState(memberCount);

  async function handleJoin() {
    if (!user) {
      router.push("/login");
      return;
    }

    setJoining(true);
    const supabase = createClient();

    const { error: ledenError } = await supabase
      .from("community_members")
      .insert({ community_id: communityId, user_id: user.id, role: "member" });

    if (ledenError) {
      setJoining(false);
      showToast(ledenError.message, "error");
      return;
    }

    await supabase
      .from("resident_profiles")
      .upsert({ user_id: user.id, community_id: communityId, development_id: developmentId }, { onConflict: "user_id" });

    setJoining(false);
    setIsMember(true);
    setLeden((n) => n + 1);
    showToast("Je bent lid geworden van deze community!", "success");
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-body-xs font-semibold uppercase tracking-wider text-sage mb-1">
            {type}
            {developmentName && ` · ${developmentName}`}
          </p>
          <h1 className="font-display text-display-md text-warmzwart">{name}</h1>
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
          {reviewCount} reviews
        </span>
        <span className="flex items-center gap-1.5">
          <Tag size={16} />
          {activeDeals} acties
        </span>
      </div>
    </div>
  );
}
