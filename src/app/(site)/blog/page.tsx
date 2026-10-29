import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Neighbuur",
  description: "Verhalen, tips en updates over klussen, vakmensen en buurten op Neighbuur.",
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="max-w-[640px] mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C4DAB9] px-4 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#385729]" />
            <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">Blog</span>
          </span>
          <h1 className="font-display font-bold text-[38px] sm:text-[48px] leading-[44px] sm:leading-[54px] text-warmzwart mb-3">
            Verhalen uit de buurt.
          </h1>
          <p className="font-body text-[16px] leading-[24px] text-warmgrijs-dark">
            Tips, achtergrondverhalen en updates over klussen, vakmensen en buurten op Neighbuur.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="font-body text-[15px] text-warmgrijs">Hier verschijnen binnenkort de eerste artikelen.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="hard-lg bg-white overflow-hidden no-underline block">
                {post.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-[180px] object-cover" />
                )}
                <div className="p-5">
                  <h2 className="font-display font-bold text-[19px] leading-[25px] text-warmzwart mb-2">{post.title}</h2>
                  {post.excerpt && <p className="font-body text-[14px] leading-[21px] text-warmgrijs-dark line-clamp-3">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
