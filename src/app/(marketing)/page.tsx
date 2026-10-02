import type { Metadata } from "next";
import { getDict } from "@/lib/metadata";
import { ProviderHomeClient } from "@/components/features/marketing/ProviderHomeClient";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDict();
  return { title: dict.providerHome.metaTitle, description: dict.providerHome.metaDescription };
}

export default function ProviderHomePage() {
  return <ProviderHomeClient />;
}
