"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Vuurt het blog_post_view-event — losse client-component omdat track() de browser-Supabase-client gebruikt. */
export function BlogPostViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track("blog_post_view", { slug });
  }, [slug]);

  return null;
}
