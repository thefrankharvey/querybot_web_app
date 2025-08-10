import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { postTag } from "@/lib/wp";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body: unknown = await req.json().catch(() => ({}));
    const payload = body as {
      slug?: string;
      kind?: string;
      action?: string;
      trigger?: string;
      post?: { post_name?: string };
      post_name?: string;
      post_permalink?: string;
    };
    const slug: string | undefined =
      payload.slug ||
      payload.post?.post_name ||
      payload.post_name ||
      extractSlug(payload.post_permalink);
    const kind: string =
      payload.kind || inferKind(payload.action || payload.trigger) || "update";

    if (slug) {
      revalidateTag(postTag(slug));
      revalidatePath(`/blog/${slug}`);
    }

    // Revalidate index and sitemap on all writes
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ revalidated: true, slug, kind });
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 500 }
    );
  }
}

function extractSlug(permalink?: string | null): string | undefined {
  if (!permalink) return undefined;
  try {
    const u = new URL(permalink);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.pop();
  } catch {
    const parts = String(permalink).split("/").filter(Boolean);
    return parts.pop();
  }
}

function inferKind(action?: string): "update" | "delete" | undefined {
  if (!action) return undefined;
  const a = action.toLowerCase();
  if (a.includes("delete") || a.includes("trash")) return "delete";
  if (a.includes("create") || a.includes("update") || a.includes("publish"))
    return "update";
  return undefined;
}
