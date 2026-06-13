import type { Metadata } from "next";
import Link from "next/link";
import { NotebookPen } from "lucide-react";

import { getPublishedPosts } from "@/lib/blog-posts";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  description: "Query letters, agent research, and publishing craft from Write Query Hook.",
  alternates: { canonical: absoluteUrl("/blog") },
};

// Statically generated; the scheduled deploy rebuilds this so newly-dated posts
// surface at their publish time.
export const dynamic = "force-static";

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="ambient-page px-4 pb-12 pt-8 md:px-6 md:pt-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 flex items-center gap-2 font-serif text-3xl font-semibold tracking-tight text-accent md:text-[32px]">
          <NotebookPen className="h-10 w-10" />
          Blog
        </h1>

        {posts.length === 0 ? (
          <p className="text-accent/70">
            New posts are on the way. Please check back soon.
          </p>
        ) : (
          <ul className="flex flex-col gap-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="glass-panel flex w-full cursor-pointer flex-col gap-2 p-4 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(24,44,69,0.14)] md:p-8"
                >
                  <span className="flex items-center gap-2 text-sm text-accent/60">
                    {post.date}
                    {post.scheduled ? (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Scheduled
                      </span>
                    ) : null}
                  </span>
                  <h2 className="text-xl font-semibold leading-tight text-accent">
                    {post.title}
                  </h2>
                  {post.description ? (
                    <p className="line-clamp-3 text-accent/80">
                      {post.description}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
