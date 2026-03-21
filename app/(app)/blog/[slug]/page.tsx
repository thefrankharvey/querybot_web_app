import { notFound } from "next/navigation";
import {
  getAllPostSlugs,
  getPostBySlug,
  sanitizeWordPressHtml,
  buildCanonicalUrlForPost,
  rewriteInternalLinksToBlog,
} from "@/lib/wp";
import SlushwireWeeklyPost from "../components/slushwire-weekly-post";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogPostingJsonLd } from "@/app/types";

type Params = { slug: string };

export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllPostSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 800; // 8.3 minutes

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const contentHtml = sanitizeWordPressHtml(
    rewriteInternalLinksToBlog(post.content || "", process.env.WP_SITE_URL)
  );

  const image = post.featuredImage?.node;
  const canonical = buildCanonicalUrlForPost(post.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.modified,
    url: canonical,
    image: image?.sourceUrl ? [image.sourceUrl] : undefined,
    author: post.author?.node?.name
      ? { "@type": "Person", name: post.author.node.name }
      : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  } satisfies BlogPostingJsonLd;
  return (
    <main className="ambient-page px-4 py-10 pt-8 md:px-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto w-full md:max-w-5xl">
        <Link
          href="/blog"
          className="mb-4 flex items-center gap-2 text-accent/72 transition-colors duration-300 hover:text-accent"
        >
          <ArrowLeft className="w-6 h-6" />
          <h2 className="text-md font-medium">Back</h2>
        </Link>
        <div className="glass-panel-strong flex w-full flex-col gap-4 overflow-hidden p-4 py-8 md:p-8">
          {post.title.toUpperCase().includes("SLUSHWIRE WEEK") ||
            post.title.includes("SlushWire Weekly") ? (
            <SlushwireWeeklyPost
              post={post}
              jsonLd={jsonLd}
              contentHtml={contentHtml}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export const fetchCache = "default-cache";
// Removed force-static to allow ISR to work properly with new posts
