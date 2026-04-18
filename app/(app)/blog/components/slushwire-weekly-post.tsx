import {
  processSlushwireContent,
  processSlushwireContentAlt,
} from "@/app/utils";
import { WpPost } from "@/lib/wp";
import Image from "next/image";
import React from "react";

const StyledAlerts = ({
  alertsData,
}: {
  alertsData: { reddit: number; bluesky: number; agents: number };
}) => (
  <div className="my-8 glass-panel p-6 text-center">
    <h3 className="mb-4 text-lg font-semibold text-accent">
      Weekly Alert Summary
    </h3>
    <div className="flex flex-col justify-center gap-4 md:flex-row">
      <div className="flex items-center gap-3 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-orange-800">
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
  contentHtml,
}: {
  post: WpPost;
  contentHtml: string;
}) => {
  // Determine which processing function to use based on post date
  // November 3rd, 2025 and onwards use the new format
  const cutoffDate = new Date("2025-11-03T00:00:00Z");
  const postDate = new Date(post.date);
  const useNewFormat = postDate >= cutoffDate;

  // Process all content using the appropriate utility function
  const { processedContent, alertsData } = useNewFormat
    ? processSlushwireContentAlt(contentHtml, post.excerpt)
    : processSlushwireContent(contentHtml, post.excerpt);

  return (
    <article className="prose max-w-none w-full text-accent/78">
      <h1 className="mt-4 mb-10 break-words text-center font-serif text-xl font-semibold leading-tight text-accent md:text-2xl">
        {post.title}
      </h1>
      <figure className="not-prose my-6 w-full">
        <Image
          src={"/slushwire-weekly.png"}
          alt={"Slushwire Weekly Post"}
          width={1200}
          height={630}
          className="w-full max-w-full rounded-[1.5rem] border border-white/70 shadow-[0_20px_50px_rgba(24,44,69,0.12)]"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </figure>

      {/* Render styled alerts if found */}
      {alertsData && <StyledAlerts alertsData={alertsData} />}

      <div
        className="w-full max-w-full [&_*]:max-w-full [&_a]:break-all [&_h2]:box-border [&_h2]:font-serif [&_h2]:text-accent [&_p]:text-accent/78 [&_li]:text-accent/78"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </article>
  );
};

export default SlushwireWeeklyPost;
