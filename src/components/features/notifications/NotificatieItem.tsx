import {
  Star,
  Briefcase,
  ChatCircle,
  UserPlus,
  Tag,
  Info,
  Crown,
  type IconProps,
} from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { timeAgo } from "@/lib/utils";
import type { Notificatie } from "@/types";

const ICONS: Record<Notificatie["type"], React.ComponentType<IconProps>> = {
  review: Star,
  booking: Briefcase,
  message: ChatCircle,
  invitation: UserPlus,
  group_discount: Tag,
  system: Info,
  premium: Crown,
};

const KLEUREN: Record<Notificatie["type"], string> = {
  review: "bg-oker-light text-oker",
  booking: "bg-blauw-light text-blauw",
  message: "bg-groen-light text-groen",
  invitation: "bg-lavendel-light text-lavendel",
  group_discount: "bg-terracotta-100 text-terracotta",
  system: "bg-sand text-warmgrijs-dark",
  premium: "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
};

interface NotificatieItemProps {
  notificatie: Notificatie;
  onClick: (notificatie: Notificatie) => void;
}

export function NotificatieItem({ notificatie, onClick }: NotificatieItemProps) {
  const { lang } = useLang();
  const Icon = ICONS[notificatie.type];
  const titel = lang === "en" ? notificatie.titel_en : notificatie.titel_nl;
  const inhoud = lang === "en" ? notificatie.inhoud_en : notificatie.inhoud_nl;

  return (
    <button
      onClick={() => onClick(notificatie)}
      className={`w-full flex items-start gap-3 text-left px-4 py-3.5 rounded transition-colors hover:bg-warmzwart/[0.03] ${
        notificatie.gelezen ? "" : "bg-terracotta-50/60"
      }`}
    >
      <span className={`w-9 h-9 shrink-0 rounded-sm flex items-center justify-center ${KLEUREN[notificatie.type]}`}>
        <Icon size={16} weight="fill" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={`text-body-sm ${notificatie.gelezen ? "font-medium text-warmzwart" : "font-bold text-warmzwart"}`}>
            {titel}
          </span>
          {!notificatie.gelezen && <span className="w-2 h-2 rounded-full bg-terracotta mt-1.5 shrink-0" />}
        </span>
        {inhoud && <span className="block text-body-sm text-warmgrijs mt-0.5">{inhoud}</span>}
        <span className="block text-body-xs text-warmgrijs-light mt-1">{timeAgo(notificatie.created_at)}</span>
      </span>
    </button>
  );
}
