import { processSlushwireContent } from "@/app/utils";
import { WpPost } from "@/lib/wp";
import Image from "next/image";
import Script from "next/script";
import React from "react";

const StyledAlerts = ({
  alertsData,
}: {
  alertsData: { reddit: number; bluesky: number; agents: number };
}) => (
  <div className="my-8 p-6 text-center">
    <h3 className="text-lg font-semibold mb-4 text-slate-800">
      Weekly Alert Summary
    </h3>
    <div className="flex flex-col md:flex-row gap-4 justify-center">
      <div className="flex items-center gap-3 px-4 py-2 bg-orange-100 text-orange-800 rounded-full border border-orange-200">
        <span className="text-2xl font-bold">{alertsData.reddit}</span>
        <span className="font-medium text-sm uppercase tracking-wide">
          Reddit
        </span>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
        <span className="text-2xl font-bold">{alertsData.bluesky}</span>
        <span className="font-medium text-sm uppercase tracking-wide">
          Bluesky
        </span>
      </div>
      <div className="flex items-center gap-3 px-4 py-2 bg-green-100 text-green-800 rounded-full border border-green-200">
        <span className="text-2xl font-bold">{alertsData.agents}</span>
        <span className="font-medium text-sm uppercase tracking-wide">
          Agents
        </span>
      </div>
    </div>
  </div>
);

const SlushwireWeeklyPost = ({
  post,
  jsonLd,
  contentHtml,
}: {
  post: WpPost;
  jsonLd: any;
  contentHtml: string;
}) => {
  // Process all content using the comprehensive utility function
  const { processedContent, alertsData } = processSlushwireContent(
    contentHtml,
    post.excerpt
  );

  return (
    <article className="prose dark:prose-invert">
      <h1 className="text-xl md:text-2xl font-semibold mb-10 mt-4 leading-tight break-words text-center">
        {post.title}
      </h1>
      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <figure className="not-prose my-6">
        <Image
          src={"/slushwire-weekly.png"}
          alt={"Slushwire Weekly Post"}
          width={1200}
          height={630}
          className="w-full rounded"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </figure>

      {/* Render styled alerts if found */}
      {alertsData && <StyledAlerts alertsData={alertsData} />}

      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </article>
  );
};

export default SlushwireWeeklyPost;
