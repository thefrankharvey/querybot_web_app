import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllPostSlugs,
  getPostBySlug,
  sanitizeWordPressHtml,
  buildCanonicalUrlForPost,
  rewriteInternalLinksToBlog,
  htmlToTextSummary,
} from "@/lib/wp";
import SlushwireWeeklyPost from "../components/slushwire-weekly-post";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  JsonLdScript,
  SITE_NAME,
  SITE_URL,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildSpeakableJsonLd,
} from "@/lib/seo";

type Params = { slug: string };

export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllPostSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 800; // 8.3 minutes

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonical = buildCanonicalUrlForPost(post.slug);
  const description =
    htmlToTextSummary(post.excerpt || post.content, 155) ?? undefined;
  const featuredImage = post.featuredImage?.node?.sourceUrl ?? null;
  const imageUrl = featuredImage || DEFAULT_OG_IMAGE;
  const imageWidth =
    post.featuredImage?.node?.mediaDetails?.width ?? DEFAULT_OG_IMAGE_WIDTH;
  const imageHeight =
    post.featuredImage?.node?.mediaDetails?.height ?? DEFAULT_OG_IMAGE_HEIGHT;
  const imageAlt =
    post.featuredImage?.node?.altText || post.title || DEFAULT_OG_IMAGE_ALT;
  const authorName = post.author?.node?.name ?? undefined;
  const section = post.categories?.nodes?.[0]?.name;

  return {
    title: post.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: authorName ? [authorName] : undefined,
      section,
      images: [
        {
          url: imageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: imageAlt,
          type: featuredImage ? undefined : DEFAULT_OG_IMAGE_TYPE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [imageUrl],
    },
  };
}

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

  const canonical = buildCanonicalUrlForPost(post.slug);
  const description =
    htmlToTextSummary(post.excerpt || post.content, 300) ?? undefined;
  const featuredImage = post.featuredImage?.node?.sourceUrl ?? null;
  const imageWidth = post.featuredImage?.node?.mediaDetails?.width ?? null;
  const imageHeight = post.featuredImage?.node?.mediaDetails?.height ?? null;
  const imageAlt = post.featuredImage?.node?.altText ?? null;
  const authorName = post.author?.node?.name ?? null;
  const section = post.categories?.nodes?.[0]?.name ?? null;
  const keywords = (post.tags?.nodes ?? []).map((t) => t.name).filter(Boolean);

  const blogPostingJsonLd = buildBlogPostingJsonLd({
    title: post.title,
    description,
    canonicalUrl: canonical,
    imageUrl: featuredImage,
    imageWidth,
    imageHeight,
    imageAlt,
    publishedDate: post.date,
    modifiedDate: post.modified,
    authorName,
    articleSection: section,
    keywords,
  });

  const organizationJsonLd = buildOrganizationJsonLd();
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.title, url: canonical },
  ]);
  const speakableJsonLd = buildSpeakableJsonLd(canonical);

  return (
    <main className="ambient-page px-4 py-10 pt-8 md:px-6">
      <JsonLdScript id="jsonld-blogposting" data={blogPostingJsonLd} />
      <JsonLdScript id="jsonld-organization" data={organizationJsonLd} />
      <JsonLdScript id="jsonld-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLdScript id="jsonld-speakable" data={speakableJsonLd} />
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
            <SlushwireWeeklyPost post={post} contentHtml={contentHtml} />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export const fetchCache = "default-cache";
// Removed force-static to allow ISR to work properly with new posts
