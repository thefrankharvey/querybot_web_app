import { WpPost } from "@/lib/wp";
import Image from "next/image";
import React from "react";
import { extractAlertsData } from "@/app/utils";

const SlushwireWeeklyThumbnail = ({ post }: { post: WpPost }) => {
  const alertsData = extractAlertsData(post.excerpt, post.content);

  return (
    <li key={post.id} className="flex flex-col md:flex-row gap-8 items-center">
      <div className="relative h-24 w-42 shrink-0 overflow-hidden rounded">
        <Image
          src={"/slushwire-weekly.png"}
          alt={"Slushwire Weekly Post"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 33vw, 250px"
        />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold leading-tight break-words">
          {post.title}
        </h2>

        {alertsData && (
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full border border-orange-200">
              <span className="font-bold">{alertsData.reddit}</span>
              <span className="text-xs uppercase tracking-wide">Reddit</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
              <span className="font-bold">{alertsData.bluesky}</span>
              <span className="text-xs uppercase tracking-wide">Bluesky</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-200">
              <span className="font-bold">{alertsData.agents}</span>
              <span className="text-xs uppercase tracking-wide">Agents</span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

export default SlushwireWeeklyThumbnail;
