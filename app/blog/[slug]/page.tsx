import Image from "next/image";
import Script from "next/script";
import { notFound } from "next/navigation";
import {
  getAllPostSlugs,
  getPostBySlug,
  sanitizeWordPressHtml,
  buildCanonicalUrlForPost,
  htmlToTextSummary,
  rewriteInternalLinksToBlog,
} from "@/lib/wp";

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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article className="prose dark:prose-invert">
        <h1>{post.title}</h1>
        <Script
          id="post-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {image?.sourceUrl ? (
          <figure className="not-prose my-6">
            <Image
              src={image.sourceUrl}
              alt={image.altText || post.title}
              width={image.mediaDetails?.width || 1200}
              height={image.mediaDetails?.height || 630}
              className="w-full rounded"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
            {image.altText ? (
              <figcaption className="text-center text-sm text-muted-foreground">
                {image.altText}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </main>
  );
}

export const fetchCache = "default-cache";
export const dynamic = "force-static";
