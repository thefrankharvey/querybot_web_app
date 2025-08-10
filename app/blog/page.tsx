import Link from "next/link";
import Image from "next/image";
import { getRecentPosts, sanitizeWordPressHtml } from "@/lib/wp";

export const revalidate = 1800; // 30 min for the index

export default async function BlogIndexPage() {
  const posts = await getRecentPosts(20);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Blog</h1>
      <ul className="space-y-8">
        {posts.map((post) => {
          const image = post.featuredImage?.node;
          return (
            <li key={post.id} className="flex gap-4">
              {image?.sourceUrl ? (
                <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded">
                  <Image
                    src={image.sourceUrl}
                    alt={image.altText || post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                </div>
              ) : null}
              <div>
                <h2 className="text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <div
                  className="prose prose-sm dark:prose-invert line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeWordPressHtml(post.excerpt || ""),
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
