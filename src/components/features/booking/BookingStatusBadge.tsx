import { Clock, CheckCircle, SealCheck, XCircle } from "@phosphor-icons/react/dist/ssr";
import type { BoekingStatus } from "@/types";

const CONFIG: Record<BoekingStatus, { label: string; klasse: string; icon: typeof Clock }> = {
  requested: { label: "Aangevraagd", klasse: "badge-blauw", icon: Clock },
  confirmed: { label: "Bevestigd", klasse: "badge-groen", icon: CheckCircle },
  completed: { label: "Afgerond", klasse: "badge-lavendel", icon: SealCheck },
  cancelled: { label: "Geannuleerd", klasse: "bg-cream-dark text-warmgrijs-dark", icon: XCircle },
};

export function BookingStatusBadge({ status }: { status: BoekingStatus }) {
  const c = CONFIG[status];
  return (
    <span className={`badge ${c.klasse} shrink-0`}>
      <c.icon size={12} weight="fill" /> {c.label}
    </span>
  );
}
