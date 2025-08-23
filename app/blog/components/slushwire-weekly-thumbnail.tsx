import { sanitizeWordPressHtml, WpPost } from "@/lib/wp";
import Image from "next/image";
import React from "react";

// Function to extract alerts summary from post content
const extractAlertsData = (
  excerpt: string | null,
  content: string | null
): {
  reddit: number;
  bluesky: number;
  agents: number;
} | null => {
  const textToSearch = excerpt || content || "";
  // Remove HTML tags and search for the pattern
  const cleanText = sanitizeWordPressHtml(textToSearch).replace(
    /<[^>]*>/g,
    " "
  );

  // Look for pattern like "ALERTS: 65 REDDIT 8 BLUESKY 38 AGENTS 19"
  const alertsMatch = cleanText.match(
    /ALERTS:\s*(\d+)\s+REDDIT\s+(\d+)\s+BLUESKY\s+(\d+)\s+AGENTS\s+(\d+)/i
  );

  if (alertsMatch) {
    return {
      reddit: parseInt(alertsMatch[2], 10),
      bluesky: parseInt(alertsMatch[3], 10),
      agents: parseInt(alertsMatch[4], 10),
    };
  }

  return null;
};

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
