import type { Metadata } from "next";
import { getDict } from "@/lib/metadata";
import { ResidentSignupClient } from "@/components/features/marketing/ResidentSignupClient";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDict();
  return { title: dict.residentSignup.metaTitle, description: dict.residentSignup.metaDescription };
}

export default function ResidentSignupPage() {
  return <ResidentSignupClient />;
}
