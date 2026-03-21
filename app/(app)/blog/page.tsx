import Link from "next/link";
import { getRecentPosts } from "@/lib/wp";
import SlushwireWeeklyThumbnail from "./components/slushwire-weekly-thumbnail";
import { NotebookPen } from "lucide-react";

export const revalidate = 1800; // 30 min for the index

export default async function BlogIndexPage() {
  const posts = await getRecentPosts(20);

  return (
    <main className="ambient-page px-4 pb-12 pt-8 md:px-6 md:pt-6">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 flex items-center gap-2 text-3xl font-semibold tracking-tight text-accent md:text-[32px] font-serif">
          <NotebookPen className="w-10 h-10" />
          Blog
        </h1>
        <ul className="flex flex-col gap-8">
          {posts.map((post, index) => {
            return post.title.toUpperCase().includes("SLUSHWIRE WEEK") ||
              post.title.includes("SlushWire Weekly") ? (
              <Link
                key={index}
                href={`/blog/${post.slug}`}
                className="glass-panel flex w-full cursor-pointer flex-col gap-4 p-4 py-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(24,44,69,0.14)] md:p-8"
              >
                <SlushwireWeeklyThumbnail post={post} />
              </Link>
            ) : null;
          })}
        </ul>
      </div>
    </main>
  );
}

// (
//   <li
//     key={post.id}
//     className="flex gap-4 flex-col md:flex-row items-center"
//   >
//     <div className="relative h-24 w-42 shrink-0 overflow-hidden rounded">
//       {image?.sourceUrl && (
//         <Image
//           src={
//             rewriteImageUrls(image.sourceUrl || null) ||
//             image.sourceUrl
//           }
//           alt={image.altText || post.title}
//           fill
//           className="object-cover"
//           sizes="(max-width: 768px) 33vw, 200px"
//         />
//       )}
//     </div>
//     <div>
//       <h2 className="text-xl font-semibold mb-2 leading-tight break-words">
//         {post.title}
//       </h2>
//       <div
//         className="prose prose-sm dark:prose-invert line-clamp-3 text-muted-foreground [&>*]:break-words [&>p]:leading-relaxed"
//         dangerouslySetInnerHTML={{
//           __html: sanitizeWordPressHtml(post.excerpt || ""),
//         }}
//       />
//     </div>
//   </li>
// )
