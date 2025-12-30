import Link from "next/link";
import Image from "next/image";
import {
  getRecentPosts,
  sanitizeWordPressHtml,
  rewriteImageUrls,
} from "@/lib/wp";
import SlushwireWeeklyThumbnail from "./components/slushwire-weekly-thumbnail";
import { NotebookPen } from "lucide-react";

export const revalidate = 1800; // 30 min for the index

export default async function BlogIndexPage() {
  const posts = await getRecentPosts(20);

  return (
    <main className="mx-auto max-w-4xl pb-10">
      <h1 className="mb-6 text-3xl md:text-[32px] font-semibold tracking-tight flex gap-4 items-center text-accent">
        <NotebookPen className="w-10 h-10" />
        Blog
      </h1>
      <ul className="space-y-8">
        {posts.map((post, index) => {
          const image = post.featuredImage?.node;

          return (
            <Link
              key={index}
              href={`/blog/${post.slug}`}
              className="bg-white cursor-pointer rounded-lg p-4 py-8 md:p-8 w-full shadow-md flex flex-col gap-4 hover:shadow-lg transition-all duration-300"
            >
              {post.title.toUpperCase().includes("SLUSHWIRE WEEK") ||
              post.title.includes("SlushWire Weekly") ? (
                <SlushwireWeeklyThumbnail post={post} />
              ) : (
                <li
                  key={post.id}
                  className="flex gap-4 flex-col md:flex-row items-center"
                >
                  <div className="relative h-24 w-42 shrink-0 overflow-hidden rounded">
                    {image?.sourceUrl && (
                      <Image
                        src={
                          rewriteImageUrls(image.sourceUrl || null) ||
                          image.sourceUrl
                        }
                        alt={image.altText || post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 200px"
                      />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2 leading-tight break-words">
                      {post.title}
                    </h2>
                    <div
                      className="prose prose-sm dark:prose-invert line-clamp-3 text-muted-foreground [&>*]:break-words [&>p]:leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeWordPressHtml(post.excerpt || ""),
                      }}
                    />
                  </div>
                </li>
              )}
            </Link>
          );
        })}
      </ul>
    </main>
  );
}
