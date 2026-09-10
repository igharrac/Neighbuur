import { Crown } from "@phosphor-icons/react";

export function PremiumBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const padding = size === "sm" ? "px-2 py-0.5 text-body-xs" : "px-2.5 py-1 text-body-sm";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm bg-gradient-to-r from-amber-400 to-amber-600 text-white font-semibold ${padding}`}
    >
      <Crown size={size === "sm" ? 12 : 14} weight="fill" />
      Neighbuur Pro
    </span>
  );
}
