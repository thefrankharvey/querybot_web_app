import { notFound } from "next/navigation";
import {
  getAllPostSlugs,
  getPostBySlug,
  sanitizeWordPressHtml,
  buildCanonicalUrlForPost,
  htmlToTextSummary,
  rewriteInternalLinksToBlog,
} from "@/lib/wp";
import SlushwireWeeklyPost from "../components/slushwire-weekly-post";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SlushwireBlogPost from "../components/slushwire-blog-post";

type Params = { slug: string };

export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllPostSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const canonical = buildCanonicalUrlForPost(post.slug);
  const description = htmlToTextSummary(
    post.excerpt || post.content || undefined
  );
  const ogImage = post.featuredImage?.node?.sourceUrl || undefined;
  const width = post.featuredImage?.node?.mediaDetails?.width || undefined;
  const height = post.featuredImage?.node?.mediaDetails?.height || undefined;
  const ogImages = ogImage
    ? [
        {
          url: ogImage,
          width,
          height,
          alt: post.featuredImage?.node?.altText || post.title,
        },
      ]
    : [];
  return {
    title: post.title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: post.title,
      description: description,
      images: ogImages,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: { index: true, follow: true },
  } as const;
}

export const revalidate = 21600; // 6 hours

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
  } as const;
  return (
    <main className="w-full md:mx-auto md:max-w-5xl py-10">
      <Link
        href="/blog"
        className="flex w-full items-center gap-2 hover:text-accent transition-colors duration-300 mb-6"
      >
        <ArrowLeft className="w-8 h-8" />
        <h2 className="text-2xl">Back</h2>
      </Link>
      <div className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md flex flex-col gap-4">
        {post.title.toUpperCase().includes("SLUSHWIRE WEEK") ? (
          <SlushwireWeeklyPost
            post={post}
            jsonLd={jsonLd}
            contentHtml={contentHtml}
          />
        ) : (
          <SlushwireBlogPost
            post={post}
            jsonLd={jsonLd}
            contentHtml={contentHtml}
          />
        )}
      </div>
    </main>
  );
}

export const fetchCache = "default-cache";
export const dynamic = "force-static";
