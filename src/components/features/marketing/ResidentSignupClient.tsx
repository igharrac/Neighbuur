"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/hooks/useLang";
import { useToast } from "@/components/ui/Toast";
import { Input, Textarea } from "@/components/ui/Input";
import { track, captureUtmParams } from "@/lib/analytics";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

export function ResidentSignupClient() {
  const { dict, lang } = useLang();
  const router = useRouter();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [postcode, setPostcode] = useState("");
  const [homePlans, setHomePlans] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !postcode.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bewoners/inschrijven", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          postcode: postcode.trim(),
          homePlans: homePlans.trim() || null,
          lang,
          utm: captureUtmParams(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Inschrijven mislukt");

      track("resident_signup_completed");
      router.push("/bewoners/inschrijven/bevestigd");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Inschrijven mislukt", "error");
      setSubmitting(false);
    }
  }

  return (
    <>
      <MarketingHeader back={{ href: "/bewoners", label: dict.residentSignup.back }} />

      <div className="max-w-[480px] mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-[30px] sm:text-[34px] leading-[38px] sm:leading-[42px] tracking-[-0.5px] text-warmzwart mb-3">
          <span className="block">{dict.residentSignup.title}</span>
          <span className="block">{dict.residentSignup.titleAccent}</span>
        </h1>
        <p className="font-body text-[15px] leading-[22px] text-warmgrijs-dark mb-8">{dict.residentSignup.body}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={dict.residentSignup.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            type="email"
            label={dict.residentSignup.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={dict.residentSignup.postcode}
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            required
          />
          <Textarea
            label={dict.residentSignup.homePlansLabel}
            placeholder={dict.residentSignup.homePlansPlaceholder}
            value={homePlans}
            onChange={(e) => setHomePlans(e.target.value)}
          />
          <button type="submit" disabled={submitting} className="btn-primary justify-center mt-2 disabled:opacity-60">
            {dict.residentSignup.cta}
          </button>
        </form>
      </div>

      <MarketingFooter />
    </>
  );
}
