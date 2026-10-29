import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://neighbuur.nl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/profiel", "/berichten", "/notificaties", "/plan", "/admin", "/api"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
