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

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

function getOperationName(query: string): string {
  const match = query.match(/\b(query|mutation)\s+(\w+)/);
  return match?.[2] ?? "anonymous";
}

function getEndpointHost(endpoint: string | undefined): string {
  if (!endpoint) return "<unset>";
  try {
    return new URL(endpoint).host;
  } catch {
    return "<invalid>";
  }
}

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
  const operationName = getOperationName(query);
  const endpointHost = getEndpointHost(WPGRAPHQL_ENDPOINT);
  const variableKeys = variables ? Object.keys(variables) : [];

  if (!WPGRAPHQL_ENDPOINT) {
    console.error("[wp.graphqlFetch] Missing WPGRAPHQL_ENDPOINT env var", {
      operationName,
      variableKeys,
    });
    throw new Error("Missing WPGRAPHQL_ENDPOINT env var");
  }

  const hasExplicitCache =
    !!nextFetchOptions && "cache" in (nextFetchOptions as RequestInit);

  const baseInit: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    ...nextFetchOptions,
  };

  // Only attach Next.js ISR options when the caller hasn't explicitly
  // opted out via `cache: "no-store"` (the two options conflict).
  if (!hasExplicitCache) {
    (
      baseInit as RequestInit & {
        next?: { revalidate?: number; tags?: string[] };
      }
    ).next = {
      revalidate: revalidate ?? 500,
      tags,
    };
  } else if (tags && tags.length > 0) {
    // Preserve tag-based revalidation even when bypassing the data cache
    (baseInit as RequestInit & { next?: { tags?: string[] } }).next = { tags };
  }

  let response: Response;
  try {
    response = await fetch(WPGRAPHQL_ENDPOINT, baseInit);
  } catch (err) {
    console.error("[wp.graphqlFetch] Network/fetch failed", {
      operationName,
      endpointHost,
      variableKeys,
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const bodyPreview = await response
      .text()
      .then((t) => t.slice(0, 300))
      .catch(() => "<unreadable>");
    console.error("[wp.graphqlFetch] Non-JSON response from WPGraphQL", {
      operationName,
      endpointHost,
      status: response.status,
      contentType,
      bodyPreview,
    });
    throw new Error(
      `WPGraphQL returned non-JSON response (status ${response.status}, content-type ${contentType})`,
    );
  }

  let json: GraphQLResponse<T>;
  try {
    json = (await response.json()) as GraphQLResponse<T>;
  } catch (err) {
    console.error("[wp.graphqlFetch] Failed to parse JSON response", {
      operationName,
      endpointHost,
      status: response.status,
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  if (json.errors && json.errors.length > 0) {
    console.error("[wp.graphqlFetch] GraphQL errors returned", {
      operationName,
      endpointHost,
      status: response.status,
      errors: json.errors.map((e) => e.message),
      variableKeys,
    });
    throw new Error(json.errors.map((e) => e.message).join("\n"));
  }
  if (!json.data) {
    console.error("[wp.graphqlFetch] No data returned from WPGraphQL", {
      operationName,
      endpointHost,
      status: response.status,
      variableKeys,
    });
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
  // Use cache: "no-store" to bypass Next's fetch data cache (2 MB limit per entry),
  // since post content can exceed that threshold. Route-level `revalidate` in the
  // /blog/[slug] segment still provides ISR at the page level.
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
    nextFetchOptions: { cache: "no-store" },
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
    revalidate: 0,
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
      // SVG icons injected by the blog regex transforms in app/utils.ts.
      "svg",
      "path",
      "circle",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      // Preserve Tailwind `class` everywhere plus common inline hooks so the
      // regex-based styling in app/utils.ts survives a second sanitize pass.
      "*": ["class", "id", "style"],
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
        "class",
      ],
      a: ["href", "name", "target", "rel", "class"],
      iframe: [
        "src",
        "width",
        "height",
        "title",
        "allow",
        "allowfullscreen",
        "frameborder",
        "class",
      ],
      svg: [
        "xmlns",
        "width",
        "height",
        "viewBox",
        "fill",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "class",
      ],
      path: ["d", "fill", "stroke", "class"],
      circle: ["cx", "cy", "r", "fill", "stroke", "class"],
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
      // Rewrite image URLs to replace .com with .site
      img: (_tagName: string, attribs: Record<string, string>) => {
        const nextAttribs: Record<string, string> = { ...attribs };
        if (nextAttribs.src) {
          nextAttribs.src =
            rewriteImageUrls(nextAttribs.src) || nextAttribs.src;
        }
        if (nextAttribs.srcset) {
          nextAttribs.srcset =
            rewriteImageUrls(nextAttribs.srcset) || nextAttribs.srcset;
        }
        return {
          tagName: "img",
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
  maxLen = 155,
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
  wpSiteUrl?: string | null,
): string {
  const site = (wpSiteUrl || process.env.WP_SITE_URL || "").replace(/\/$/, "");
  if (!site) return html;
  // Replace links like https://wp-site.com/slug/ => https://our-site.com/blog/slug/
  return html.replace(
    new RegExp(`${escapeRegExp(site)}/([A-Za-z0-9\-]+)/`, "g"),
    (_match, slug) => {
      const canonicalSite =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
      const trailingSlash = true;
      const dest = `${canonicalSite}/blog/${slug}`;
      return trailingSlash ? `${dest}/` : dest;
    },
  );
}

export function rewriteImageUrls(imageUrl: string | null): string | null {
  if (!imageUrl) return imageUrl;
  // Replace .com with .site in image URLs
  return imageUrl.replace(/\.com/g, ".site");
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
