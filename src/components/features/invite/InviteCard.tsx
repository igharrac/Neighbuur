"use client";

import { WhatsappLogo, Copy, UsersThree } from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo, whatsappShareUrl } from "@/lib/utils";

interface Genodigde {
  naam: string;
  datum: string;
}

export function InviteCard({ code, genodigden }: { code: string; genodigden: Genodigde[] }) {
  const { dict } = useLang();
  const { showToast } = useToast();

  const link = `neighbuur.nl/uitnodiging/${code}`;
  const fullUrl = `https://${link}`;

  function handleCopy() {
    navigator.clipboard.writeText(fullUrl);
    showToast(dict.invite.copied, "success");
  }

  function handleWhatsapp() {
    const message = dict.invite.whatsappMessage.replace("{url}", fullUrl);
    window.open(whatsappShareUrl(message), "_blank");
  }

  return (
    <div className="bg-white rounded-md shadow-soft p-6 md:p-7 max-w-[520px] mx-auto">
      <h1 className="font-display text-display-sm text-warmzwart mb-1">{dict.invite.title}</h1>
      <p className="text-body-sm text-warmgrijs mb-6">{dict.invite.subtitle}</p>

      <label className="text-body-sm font-semibold block mb-1.5">{dict.invite.yourLink}</label>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 px-4 py-3 rounded-md border-2 border-lijn bg-cream text-body-sm text-warmzwart truncate">
          {link}
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        <button onClick={handleCopy} className="btn-secondary flex-1 !text-body-sm">
          <Copy size={16} />
          {dict.invite.copy}
        </button>
        <button onClick={handleWhatsapp} className="btn flex-1 bg-[#25D366] text-white !text-body-sm hover:-translate-y-0.5 hover:shadow-medium">
          <WhatsappLogo size={16} weight="fill" />
          {dict.invite.whatsapp}
        </button>
      </div>

      <h2 className="font-bold text-body-sm text-warmzwart mb-3">{dict.invite.via}</h2>
      {genodigden.length === 0 ? (
        <div className="flex items-center gap-2.5 p-4 rounded-md bg-cream text-body-sm text-warmgrijs">
          <UsersThree size={20} />
          {dict.invite.none}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {genodigden.map((g, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-md border border-lijn">
              <Avatar naam={g.naam} size="sm" />
              <span className="font-medium text-body-sm text-warmzwart flex-1">{g.naam}</span>
              <span className="text-body-xs text-warmgrijs">{timeAgo(g.datum)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
