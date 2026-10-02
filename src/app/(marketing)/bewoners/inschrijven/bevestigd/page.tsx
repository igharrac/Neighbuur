import type { Metadata } from "next";
import { getDict } from "@/lib/metadata";
import { ResidentConfirmationClient } from "@/components/features/marketing/ResidentConfirmationClient";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDict();
  return { title: dict.residentConfirmation.metaTitle, description: dict.residentConfirmation.metaDescription };
}

export default function ResidentConfirmationPage() {
  return <ResidentConfirmationClient />;
}
