import type { Metadata } from "next";
import { getDict } from "@/lib/metadata";
import { ResidentHomeClient } from "@/components/features/marketing/ResidentHomeClient";

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDict();
  return { title: dict.residentHome.metaTitle, description: dict.residentHome.metaDescription };
}

export default function ResidentHomePage() {
  return <ResidentHomeClient />;
}
