import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://neighbuur.nl";

const STATIC_ROUTES = ["/", "/bewoners", "/diensten", "/wijk", "/blog", "/privacy", "/voorwaarden/bewoner", "/voorwaarden/vakman"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${APP_URL}/blog/${post.slug}`,
    lastModified: post.published_at,
  }));

  return [...staticEntries, ...postEntries];
}
