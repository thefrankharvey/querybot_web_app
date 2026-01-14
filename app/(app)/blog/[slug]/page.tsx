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
    <main className="w-full md:mx-auto md:max-w-5xl py-10 pt-19">
      <Link
        href="/blog"
        className="flex items-center gap-2 hover:text-accent transition-colors duration-300 mb-4"
      >
        <ArrowLeft className="w-6 h-6" />
        <h2 className="text-md font-medium">Back</h2>
      </Link>
      <div className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md flex flex-col gap-4 overflow-hidden">
        {post.title.toUpperCase().includes("SLUSHWIRE WEEK") ||
        post.title.includes("SlushWire Weekly") ? (
          <SlushwireWeeklyPost
            post={post}
            jsonLd={jsonLd}
            contentHtml={contentHtml}
          />
        ) : null}
      </div>
    </main>
  );
}

export const fetchCache = "default-cache";
// Removed force-static to allow ISR to work properly with new posts
