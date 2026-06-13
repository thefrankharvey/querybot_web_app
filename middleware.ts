import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isBlogPublished } from "@/lib/blog-schedule";

// Returns the single blog post slug for `/blog/<slug>` requests, else null.
function directBlogSlug(pathname: string): string | null {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

const protectedRoutePrefixes = [
  "/account",
  "/agent-matches",
  "/dispatch",
  "/home",
  "/query-dashboard",
  "/saved-agents",
  "/smart-match",
  "/subscribe",
];

function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function buildSignInRedirect(req: Request, redirectPath: string) {
  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set("redirect_url", redirectPath);
  return NextResponse.redirect(signInUrl);
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // Normalize legacy/short paths
  if (pathname === "/signup") {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  // Redirect accidental/legacy blog signup path without a page
  if (pathname === "/blog/signup") {
    if (userId) {
      return NextResponse.redirect(new URL("/blog", req.url));
    }
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  if (isProtectedRoute(pathname) && !userId) {
    const redirectPath = `${pathname}${req.nextUrl.search}`;
    return buildSignInRedirect(req, redirectPath);
  }

  // Date-gate blog posts: a post whose dated slug is in the future (or has no
  // date / is a draft) must 404, even on direct URL access. This enforces the
  // schedule for every post regardless of its file format.
  const postSlug = directBlogSlug(pathname);
  if (postSlug && !isBlogPublished(postSlug)) {
    return NextResponse.rewrite(new URL("/blog-unavailable", req.url));
  }

  // Check if this looks like a blog post slug (not an existing app route)
  const isBlogPost =
    pathname.startsWith("/slushwire-") ||
    (pathname !== "/" &&
      !pathname.startsWith("/blog") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/sign-") &&
      !pathname.startsWith("/saved-agents") &&
      !pathname.startsWith("/home") &&
      !pathname.startsWith("/query-dashboard") &&
      !pathname.startsWith("/creator-resources") &&
      !pathname.startsWith("/subscribe") &&
      !pathname.startsWith("/agent-matches") &&
      !pathname.startsWith("/account") &&
      !pathname.startsWith("/smart-match") &&
      !pathname.startsWith("/dispatch") &&
      !pathname.startsWith("/about") &&
      !pathname.startsWith("/legal") &&
      !pathname.startsWith("/thank-you") &&
      !pathname.includes(".") &&
      pathname.split("/").length === 2);

  if (isBlogPost) {
    const blogPath = `/blog${pathname}`;

    if (userId) {
      // User is signed in, redirect to blog version
      return NextResponse.redirect(new URL(blogPath, req.url));
    }
    // Anonymous users and crawlers: serve the blog content at the legacy
    // slug so search engines can index it without a sign-in wall.
    const rewriteUrl = new URL(blogPath, req.url);
    rewriteUrl.search = req.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Run for API routes but exclude webhook paths (more explicit)
    "/((?!api/webhooks)api/.*)",
    // Include trpc routes
    "/trpc/(.*)",
  ],
};
