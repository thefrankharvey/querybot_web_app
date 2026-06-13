import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Author metadata feeds Person JSON-LD (E-E-A-T signals) on blog posts.
 * Reference an author from a post's BLOG_CONFIG via `author: AUTHORS.<key>`.
 */
export interface AuthorMeta {
  name: string;
  title?: string;
  url?: string;
  bio?: string;
  image?: string;
  sameAs?: string[];
}

export const AUTHORS = {
  /** Default house byline. */
  team: {
    name: SITE_NAME,
    title: "Editorial Team",
    url: SITE_URL,
  },
  carly: {
    name: "Carly Rivera",
    title: "Contributing Writer",
  },
  victor: {
    name: "Victor Nguyen",
    title: "Contributing Writer",
  },
} satisfies Record<string, AuthorMeta>;

export type AuthorKey = keyof typeof AUTHORS;
