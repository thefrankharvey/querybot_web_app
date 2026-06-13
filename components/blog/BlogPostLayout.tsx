import Link from "next/link";

import {
  JsonLdScript,
  absoluteUrl,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo";
import { getPublishAt, type BlogConfig, type BlogSection } from "@/lib/blog-seo";

export interface RelatedPost {
  slug: string;
  title: string;
}

export interface BlogPostLayoutProps {
  slug: string;
  config: BlogConfig;
  tldr?: string[];
  relatedPosts?: RelatedPost[];
  extraJsonLd?: Record<string, unknown>[];
}

function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Content text ships through dangerouslySetInnerHTML — authors own the trust. */
function html(text: string) {
  return { __html: text };
}

function SectionBody({ section }: { section: BlogSection }) {
  return (
    <>
      {section.content.map((item, index) => {
        if (item.type === "paragraph") {
          return (
            <p
              key={index}
              className="mb-5 leading-7 text-accent/90 break-words"
              dangerouslySetInnerHTML={html(item.text)}
            />
          );
        }
        if (item.type === "list") {
          return (
            <ul
              key={index}
              className="mb-5 list-disc space-y-2 pl-6 text-accent/90"
            >
              {item.items.map((li, liIndex) => (
                <li
                  key={liIndex}
                  className="break-words"
                  dangerouslySetInnerHTML={html(li)}
                />
              ))}
            </ul>
          );
        }
        // qa
        return (
          <div key={index} className="mb-6 space-y-5">
            {item.items.map((qa, qaIndex) => (
              <div key={qaIndex}>
                <h3 className="mb-2 text-lg font-semibold text-accent">
                  {qa.question}
                </h3>
                <p
                  className="leading-7 text-accent/90 break-words"
                  dangerouslySetInnerHTML={html(qa.answer)}
                />
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

export function BlogPostLayout({
  slug,
  config,
  tldr = [],
  relatedPosts = [],
  extraJsonLd = [],
}: BlogPostLayoutProps) {
  const canonicalUrl = absoluteUrl(`/blog/${slug}`);
  const publishAt = getPublishAt(slug, config);
  const publishedIso = publishAt?.toISOString() ?? config.publishedDate ?? "";

  const faqs = config.sections
    .flatMap((section) => section.content)
    .filter((item) => item.type === "qa")
    .flatMap((item) => (item.type === "qa" ? item.items : []));

  const blogPostingJsonLd = buildBlogPostingJsonLd({
    title: config.title,
    description: config.description,
    canonicalUrl,
    imageUrl: config.ogImageUrl,
    imageAlt: config.ogImageAlt,
    publishedDate: publishedIso,
    modifiedDate: config.modifiedDate,
    authorName: config.authorName ?? config.author?.name,
    articleSection: config.articleSection,
    keywords: config.keywords,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Blog", url: absoluteUrl("/blog") },
    { name: config.title, url: canonicalUrl },
  ]);

  return (
    <main className="ambient-page px-4 pb-16 pt-8 md:px-6">
      <div className="ambient-orb-top" />
      <JsonLdScript id="blog-posting-jsonld" data={blogPostingJsonLd} />
      <JsonLdScript id="blog-breadcrumb-jsonld" data={breadcrumbJsonLd} />
      {faqs.length > 0 ? (
        <JsonLdScript id="blog-faq-jsonld" data={buildFaqJsonLd(faqs)} />
      ) : null}
      {extraJsonLd.map((data, index) => (
        <JsonLdScript key={index} id={`blog-extra-jsonld-${index}`} data={data} />
      ))}

      <article className="mx-auto max-w-3xl">
        <nav className="mb-6 text-sm text-accent/60">
          <Link href="/blog" className="hover:underline">
            ← Blog
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-accent md:text-4xl">
            {config.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-accent/60">
            {config.author?.name || config.authorName ? (
              <span>{config.author?.name ?? config.authorName}</span>
            ) : null}
            {(config.author?.name || config.authorName) && config.date ? (
              <span aria-hidden>&bull;</span>
            ) : null}
            {config.date ? (
              <time dateTime={publishedIso || undefined}>{config.date}</time>
            ) : null}
            {config.readTime ? (
              <>
                <span aria-hidden>&bull;</span>
                <span>{config.readTime}</span>
              </>
            ) : null}
          </div>
        </header>

        {config.ogImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.ogImageUrl}
            alt={config.ogImageAlt || config.title}
            className="mb-8 w-full rounded-xl object-cover"
            loading="eager"
          />
        ) : null}

        {tldr.length > 0 ? (
          <section className="speakable-tldr mb-10 rounded-xl border border-accent/15 bg-accent/5 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent/70">
              The short version
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-accent/90">
              {tldr.map((point, index) => (
                <li key={index} className="break-words">
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="blog-content">
          {config.sections.map((section, index) => (
            <section key={index} className="mb-8">
              {section.heading ? (
                <h2
                  id={sectionId(section.heading)}
                  className="mb-4 scroll-mt-24 text-2xl font-semibold text-accent"
                >
                  {section.heading}
                </h2>
              ) : null}
              <SectionBody section={section} />
            </section>
          ))}
        </div>

        {relatedPosts.length > 0 ? (
          <section className="mt-12 border-t border-accent/15 pt-6">
            <h2 className="mb-4 text-xl font-semibold text-accent">
              Continue reading
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-accent/90">
              {relatedPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}
