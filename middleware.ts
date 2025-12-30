import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

  // Check if this looks like a blog post slug (not an existing app route)
  const isBlogPost =
    pathname.startsWith("/slushwire-") ||
    (pathname !== "/" &&
      !pathname.startsWith("/blog") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/sign-") &&
      !pathname.startsWith("/saved-agents") &&
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
    } else {
      // User is not signed in, redirect to sign-in page with intended destination
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Run for API routes but exclude webhook paths (more explicit)
    "/((?!api/webhooks)api/.*)",
    // Include trpc routes
    "/trpc/(.*)",
  ],
};
