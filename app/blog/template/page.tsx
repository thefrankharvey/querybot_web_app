import { buildBlogMetadata, blogPublishGate } from "@/lib/blog-seo";
import type { BlogConfig } from "@/lib/blog-seo";
import { AUTHORS } from "@/constants/authors";
import { BlogPostLayout } from "@/components/blog/BlogPostLayout";

/**
 * Scaffold for a new post. To publish one:
 *
 *   1. Copy this folder to  app/blog/<clean-slug>-MM-DD-YYYY-<am|pm>/
 *        - `am` => goes live 10:00 ET on that date
 *        - `pm` => goes live 18:00 ET on that date
 *   2. Set SLUG below to the new folder name (date suffix included).
 *   3. Fill in BLOG_CONFIG, TLDR, and RELATED_POSTS.
 *   4. Remove `status: "draft"`.
 *
 * This `template/` folder is excluded from the listing, sitemap, and feed, and
 * `status: "draft"` keeps the route itself returning 404.
 */

const SLUG = "template";

export const BLOG_CONFIG: BlogConfig = {
  title: "Post title",
  description: "150–160 character meta description.",
  date: "Month D, YYYY",
  readTime: "5 min read",
  keywords: [],
  articleSection: "Querying",
  authorName: AUTHORS.team.name,
  author: AUTHORS.team,
  status: "draft",
  sections: [
    {
      heading: "",
      content: [{ type: "paragraph", text: "Intro paragraph." }],
    },
  ],
};

const TLDR: string[] = [];
const RELATED_POSTS: { slug: string; title: string }[] = [];

export const metadata = buildBlogMetadata(SLUG, BLOG_CONFIG);

export default function BlogPost() {
  blogPublishGate(SLUG, BLOG_CONFIG);

  return (
    <BlogPostLayout
      slug={SLUG}
      config={BLOG_CONFIG}
      tldr={TLDR}
      relatedPosts={RELATED_POSTS}
    />
  );
}
