import type { Metadata } from "next";
import { getDict } from "@/lib/metadata";
import { ProviderConfirmationClient } from "@/components/features/marketing/ProviderConfirmationClient";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDict();
  return { title: dict.providerConfirmation.metaTitle, description: dict.providerConfirmation.metaDescription };
}

export default function ProviderConfirmationPage() {
  return <ProviderConfirmationClient />;
}
