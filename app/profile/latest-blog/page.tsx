import {
  buildCanonicalUrlForPost,
  getPostBySlug,
  getRecentPosts,
  rewriteInternalLinksToBlog,
  sanitizeWordPressHtml,
} from "@/lib/wp";
import SlushwireBlogPost from "@/app/blog/components/slushwire-blog-post";
import SlushwireWeeklyPost from "@/app/blog/components/slushwire-weekly-post";
import { BlogPostingJsonLd } from "@/app/types";
import { notFound } from "next/navigation";

const LatestBlog = async () => {
  const posts = await getRecentPosts(1);
  const currentPost = posts[0];
  const post = await getPostBySlug(currentPost.slug);
  if (!post) return notFound();

  const contentHtml = sanitizeWordPressHtml(
    rewriteInternalLinksToBlog(post.content || "", process.env.WP_SITE_URL)
  );

  const image = post.featuredImage?.node;
  const canonical = buildCanonicalUrlForPost(currentPost.slug);
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
    <div className="w-full flex flex-col justify-start md:w-[1000px] md:mx-auto">
      <h1 className="text-2xl md:text-[40px] font-extrabold leading-tight mb-4 flex items-center gap-4">
        Latest Blog
      </h1>
      <main className="w-full md:mx-auto pb-10">
        <div className="bg-white rounded-lg p-4 py-8 md:p-8 w-full shadow-md flex flex-col gap-4">
          {post.title.toUpperCase().includes("SLUSHWIRE WEEK") ||
          post.title.includes("SlushWire Weekly") ? (
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
    </div>
  );
};

export default LatestBlog;
