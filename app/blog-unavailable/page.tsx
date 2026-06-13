import { notFound } from "next/navigation";

/**
 * Target of the middleware rewrite for unpublished/future-dated blog posts.
 * Renders the app's styled 404 with a 404 status while the URL stays put.
 */
export default function BlogUnavailable() {
  notFound();
}
