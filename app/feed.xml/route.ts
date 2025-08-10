import { NextResponse } from "next/server";
import {
  getRecentPosts,
  buildCanonicalUrlForPost,
  sanitizeWordPressHtml,
} from "@/lib/wp";

export const revalidate = 1800; // 30 min

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const title = "Query Blog";
  const description = "Latest articles from Query.";
  const posts = await getRecentPosts(20);
  const items = posts
    .map((p) => {
      const url = buildCanonicalUrlForPost(p.slug);
      const content = sanitizeWordPressHtml(p.content || p.excerpt || "");
      return `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${url}</link>
        <guid>${url}</guid>
        <pubDate>${new Date(p.date).toUTCString()}</pubDate>
        <description><![CDATA[${content}]]></description>
      </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title><![CDATA[${title}]]></title>
      <link>${site}</link>
      <description><![CDATA[${description}]]></description>
      ${items}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
