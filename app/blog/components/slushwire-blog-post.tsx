import { processBlogContent } from "@/app/utils";
import { WpPost } from "@/lib/wp";
import Image from "next/image";
import Script from "next/script";

const SlushwireBlogPost = ({
  post,
  jsonLd,
  contentHtml,
}: {
  post: WpPost;
  jsonLd: any;
  contentHtml: string;
}) => {
  const processedContent = processBlogContent(contentHtml);
  const image = post.featuredImage?.node;

  return (
    <article className="prose dark:prose-invert">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 mt-4 leading-tight break-words text-center">
        {post.title}
      </h1>
      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {image?.sourceUrl ? (
        <figure className="not-prose my-6 max-w-[620px] mx-auto">
          <Image
            src={image.sourceUrl}
            alt={image.altText || post.title}
            width={image.mediaDetails?.width || 1200}
            height={image.mediaDetails?.height || 630}
            className="w-full rounded"
            sizes="(max-width: 768px) 100vw, 620px"
            priority
          />
          {image.altText ? (
            <figcaption className="text-center text-sm text-muted-foreground">
              {image.altText}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </article>
  );
};

export default SlushwireBlogPost;
