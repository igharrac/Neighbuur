import type { Metadata } from "next";
import { getDict } from "@/lib/metadata";
import { RegistratieForm } from "@/components/features/vakman/RegistratieForm";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDict();
  return { title: dict.providerSignup.metaTitle, description: dict.providerSignup.metaDescription };
}

export default function RegistreerVakmanPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return <RegistratieForm refBron={searchParams.ref} />;
}
