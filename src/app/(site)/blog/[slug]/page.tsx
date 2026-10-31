import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { getPublishedPostBySlug } from "@/lib/blog";
import { BlogPostViewTracker } from "@/components/features/blog/BlogPostViewTracker";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://neighbuur.nl";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) return {};

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || undefined;

  return {
    title: `${title} — Neighbuur`,
    description,
    alternates: { canonical: `${APP_URL}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_url ?? undefined,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: "Team Neighbuur" },
    publisher: { "@type": "Organization", name: "Neighbuur" },
    mainEntityOfPage: `${APP_URL}/blog/${post.slug}`,
  };

  return (
    <div className="bg-cream-warm min-h-screen">
      <BlogPostViewTracker slug={post.slug} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="max-w-[760px] mx-auto px-6 py-14">
        <h1 className="font-display font-bold text-[32px] sm:text-[42px] leading-[38px] sm:leading-[48px] text-warmzwart mb-3">
          {post.title}
        </h1>
        <p className="text-body-sm text-warmgrijs mb-6">
          Team Neighbuur{post.published_at ? ` · ${format(new Date(post.published_at), "d MMMM yyyy", { locale: nl })}` : ""}
        </p>
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_image_url} alt={post.title} className="hard-lg w-full h-[280px] sm:h-[360px] object-cover mb-8" />
        )}
        {/* eslint-disable-next-line react/no-danger */}
        <div className="font-body text-[16px] leading-[26px] text-warmgrijs-dark [&>h2]:font-display [&>h2]:font-bold [&>h2]:text-[22px] [&>h2]:text-warmzwart [&>h2]:mt-8 [&>h2]:mb-3 [&>p]:mb-4 [&>a]:text-sage [&>a]:underline" dangerouslySetInnerHTML={{ __html: post.body_html }} />
      </article>
    </div>
  );
}
