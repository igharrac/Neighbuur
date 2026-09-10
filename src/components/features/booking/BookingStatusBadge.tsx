import { Clock, CheckCircle, SealCheck, XCircle } from "@phosphor-icons/react";
import type { BoekingStatus } from "@/types";

const CONFIG: Record<BoekingStatus, { label: string; klasse: string; icon: typeof Clock }> = {
  aangevraagd: { label: "Aangevraagd", klasse: "badge-blauw", icon: Clock },
  bevestigd: { label: "Bevestigd", klasse: "badge-groen", icon: CheckCircle },
  afgerond: { label: "Afgerond", klasse: "badge-lavendel", icon: SealCheck },
  geannuleerd: { label: "Geannuleerd", klasse: "bg-cream-dark text-warmgrijs-dark", icon: XCircle },
};

export function BookingStatusBadge({ status }: { status: BoekingStatus }) {
  const c = CONFIG[status];
  return (
    <span className={`badge ${c.klasse} shrink-0`}>
      <c.icon size={12} weight="fill" /> {c.label}
    </span>
  );
}
