"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/hooks/useLang";
import { track } from "@/lib/analytics";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { SuccessState } from "@/components/ui/SuccessState";

export function ResidentConfirmationClient() {
  const { dict } = useLang();

  useEffect(() => {
    track("resident_confirmation_view");
  }, []);

  return (
    <>
      <MarketingHeader />
      <SuccessState
        title={dict.residentConfirmation.title}
        body={dict.residentConfirmation.body}
        cta={{ href: "/", label: dict.residentConfirmation.cta }}
      />
      <MarketingFooter />
    </>
  );
}
