import sanitizeHtml from "sanitize-html";

export type WpMedia = {
  sourceUrl: string | null;
  altText: string | null;
  mediaDetails?: { width?: number | null; height?: number | null } | null;
};

export type WpAuthor = {
  name: string | null;
  slug: string | null;
};

export type WpPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  date: string; // ISO
  modified: string; // ISO
  featuredImage?: { node: WpMedia | null } | null;
  author?: { node: WpAuthor | null } | null;
  categories?: { nodes: { name: string; slug: string }[] } | null;
  tags?: { nodes: { name: string; slug: string }[] } | null;
};

const WPGRAPHQL_ENDPOINT = process.env.WPGRAPHQL_ENDPOINT as string | undefined;

// Soft warn at runtime; avoid lint warning about no-console by guarding in dev only
if (!WPGRAPHQL_ENDPOINT && process.env.NODE_ENV !== "production") {
  // noop dev hint; removed console to avoid lint warning
}

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

async function graphqlFetch<T>(args: {
  query: string;
  variables?: Record<string, unknown>;
  /** cache tags to target with revalidateTag */
  tags?: string[];
  /** seconds; defaults handled per caller */
  revalidate?: number;
  nextFetchOptions?: RequestInit;
}): Promise<T> {
  const { query, variables, tags, revalidate, nextFetchOptions } = args;
  if (!WPGRAPHQL_ENDPOINT) {
    throw new Error("Missing WPGRAPHQL_ENDPOINT env var");
  }
  const response = await fetch(WPGRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // Use Next.js fetch cache with ISR and tags
    next: { revalidate: revalidate ?? 21600, tags },
    ...nextFetchOptions,
  });
  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join("\n"));
  }
  if (!json.data) {
    throw new Error("No data returned from WPGraphQL");
  }
  return json.data;
}

export async function getAllPostSlugs(limit = 100): Promise<string[]> {
  type Data = {
    posts: { edges: { node: { slug: string } }[] };
  };
  const data = await graphqlFetch<Data>({
    query: `
      query AllPostSlugs($first: Int!) {
        posts(first: $first, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
          edges { node { slug } }
        }
      }
    `,
    variables: { first: limit },
    tags: ["posts"],
    revalidate: 1800,
  });
  return data.posts.edges.map((e) => e.node.slug).filter(Boolean);
}

export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  type Data = { postBy: WpPost | null };
  const data = await graphqlFetch<Data>({
    query: `
      query PostBySlug($slug: String!) {
        postBy(slug: $slug) {
          id
          slug
          title
          excerpt
          content
          date
          modified
          author { node { name slug } }
          featuredImage { node { sourceUrl altText mediaDetails { width height } } }
          categories { nodes { name slug } }
          tags { nodes { name slug } }
        }
      }
    `,
    variables: { slug },
    tags: [postTag(slug)],
    revalidate: 21600,
  });
  return data.postBy;
}

export async function getRecentPosts(limit = 20): Promise<WpPost[]> {
  type Data = {
    posts: { nodes: WpPost[] };
  };
  const data = await graphqlFetch<Data>({
    query: `
      query RecentPosts($first: Int!) {
        posts(first: $first, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
          nodes {
            id
            slug
            title
            excerpt
            date
            modified
            featuredImage { node { sourceUrl altText mediaDetails { width height } } }
          }
        }
      }
    `,
    variables: { first: limit },
    tags: ["posts"],
    revalidate: 1800,
  });
  return data.posts.nodes;
}

export function postTag(slug: string): string {
  return `post:${slug}`;
}

export function sanitizeWordPressHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
      "iframe",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: [
        "src",
        "srcset",
        "sizes",
        "alt",
        "title",
        "width",
        "height",
        "loading",
        "decoding",
      ],
      a: ["href", "name", "target", "rel"],
      iframe: [
        "src",
        "width",
        "height",
        "title",
        "allow",
        "allowfullscreen",
        "frameborder",
      ],
    },
    transformTags: {
      // Enforce rel attributes for external links
      a: (_tagName: string, attribs: Record<string, string>) => {
        const href = attribs.href || "";
        const relValue =
          attribs.rel ||
          (href.startsWith("/") ? undefined : "nofollow noreferrer noopener");
        const nextAttribs: Record<string, string> = { ...attribs };
        if (relValue) nextAttribs.rel = relValue;
        return {
          tagName: "a",
          attribs: nextAttribs,
        } as unknown as sanitizeHtml.Tag;
      },
    },
  });
}

export function buildCanonicalUrlForPost(slug: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const trailingSlash = true; // mirror WP default
  const url = `${site}/blog/${slug}`;
  return trailingSlash ? `${url}/` : url;
}

export function htmlToTextSummary(
  html: string | null | undefined,
  maxLen = 155
): string | undefined {
  if (!html) return undefined;
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

export function rewriteInternalLinksToBlog(
  html: string,
  wpSiteUrl?: string | null
): string {
  const site = (wpSiteUrl || process.env.WP_SITE_URL || "").replace(/\/$/, "");
  if (!site) return html;
  // Replace links like https://wp-site.com/slug/ => https://our-site.com/blog/slug/
  return html.replace(
    new RegExp(`${escapeRegExp(site)}/([A-Za-z0-9\-]+)/`, "g"),
    (_match, slug) => {
      const canonicalSite =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
      const trailingSlash = true;
      const dest = `${canonicalSite}/blog/${slug}`;
      return trailingSlash ? `${dest}/` : dest;
    }
  );
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
