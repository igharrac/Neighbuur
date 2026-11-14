"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/hooks/useLang";
import { track } from "@/lib/analytics";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SuccessState } from "@/components/ui/SuccessState";

export function ProviderConfirmationClient() {
  return (
    <Suspense fallback={null}>
      <ProviderConfirmationInner />
    </Suspense>
  );
}

function ProviderConfirmationInner() {
  const { dict } = useLang();
  const searchParams = useSearchParams();
  const werkgebiedOnbekend = searchParams.get("werkgebied") === "onbekend";

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
        notice={werkgebiedOnbekend ? dict.providerConfirmation.werkgebiedOnbekend : undefined}
        cta={{ href: "/", label: dict.providerConfirmation.cta }}
      />
      <MarketingFooter />
    </>
  );
}
