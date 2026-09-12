"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CaretUp } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";

interface UpvoteButtonProps {
  reviewId: string;
  initialScore: number;
  initialVoted: boolean;
}

export function UpvoteButton({ reviewId, initialScore, initialVoted }: UpvoteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState(initialVoted);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);

    const supabase = createClient();
    if (voted) {
      setVoted(false);
      setScore((s) => s - 1);
      const { error } = await supabase
        .from("review_votes")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", user.id);
      if (error) {
        setVoted(true);
        setScore((s) => s + 1);
      }
    } else {
      setVoted(true);
      setScore((s) => s + 1);
      if (typeof navigator.vibrate === "function") navigator.vibrate(10);
      const { error } = await supabase
        .from("review_votes")
        .upsert({ review_id: reviewId, user_id: user.id, value: 1 }, { onConflict: "review_id,user_id" });
      if (error) {
        setVoted(false);
        setScore((s) => s - 1);
      }
    }
    setBusy(false);
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={voted}
      aria-label={voted ? "Verwijder upvote" : "Upvote deze review"}
      className={`min-w-11 min-h-11 flex items-center gap-1 justify-center text-body-sm font-semibold rounded-sm px-3 border shrink-0 transition-colors ${
        voted
          ? "bg-groen text-white border-groen"
          : "bg-groen-light text-groen border-groen/20 hover:bg-groen hover:text-white"
      }`}
    >
      <CaretUp size={14} weight="bold" />
      {score}
    </button>
  );
}
