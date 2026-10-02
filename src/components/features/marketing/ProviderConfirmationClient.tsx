"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/hooks/useLang";
import { track } from "@/lib/analytics";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SuccessState } from "@/components/ui/SuccessState";

export function ProviderConfirmationClient() {
  const { dict } = useLang();

  useEffect(() => {
    track("provider_confirmation_view");
  }, []);

  return (
    <>
      <MarketingHeader />
      <SuccessState
        title={dict.providerConfirmation.title}
        body={dict.providerConfirmation.body}
        supporting={dict.providerConfirmation.supporting}
        cta={{ href: "/", label: dict.providerConfirmation.cta }}
      />
      <MarketingFooter />
    </>
  );
}
