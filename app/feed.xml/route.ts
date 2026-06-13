import { NextResponse } from "next/server";

import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/blog-posts";

function escapeCdata(value: string): string {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

export async function GET() {
  const posts = await getPublishedPosts();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      return `
      <item>
        <title><![CDATA[${escapeCdata(post.title)}]]></title>
        <link>${url}</link>
        <guid>${url}</guid>
        <pubDate>${post.publishAt.toUTCString()}</pubDate>
        <description><![CDATA[${escapeCdata(post.description)}]]></description>
      </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title><![CDATA[${SITE_NAME}]]></title>
      <link>${SITE_URL}</link>
      <description><![CDATA[Query letters, agent research, and publishing craft.]]></description>
      ${items}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
