import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import {
  ClerkEmailAddress,
  ClerkUserEventData,
  KitListResponse,
  KitSubscriber,
  KitSubscriberRequestBody,
  KitTag,
  KitTagWithId,
  KitTagsResponse,
} from "@/app/types";
import { KIT_SUBSCRIBER_TAGS } from "@/app/constants";

// Lightweight fetch helper with AbortController timeouts to prevent webhook hangs
const DEFAULT_KIT_TIMEOUT_MS = 2500;

async function kitFetch(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_KIT_TIMEOUT_MS, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } catch (error) {
    console.error("Kit fetch error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      url: String(input),
      method: (rest.method || "GET").toString(),
      timeoutMs,
      timestamp: new Date().toISOString(),
    });
    return new Response(null, {
      status: 499,
      statusText: "Client Timeout/Abort",
    });
  } finally {
    clearTimeout(id);
  }
}

// Simple in-memory cache for tag name -> id lookups to reduce repeated /tags calls
const kitTagIdCache: Record<string, number> = {};

function getPrimaryEmailAddress(user: ClerkUserEventData): string | null {
  try {
    const primaryId = user?.primary_email_address_id ?? undefined;
    const emailAddresses: ClerkEmailAddress[] | undefined =
      user?.email_addresses;
    if (!primaryId || !Array.isArray(emailAddresses)) return null;
    const primary = emailAddresses.find((e) => e?.id === primaryId);
    return primary?.email_address ?? null;
  } catch {
    return null;
  }
}

function hasEmailShape(data: unknown): data is ClerkUserEventData {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  const emails = obj["email_addresses"];
  return Array.isArray(emails);
}

async function kitUpsertSubscriberByEmail(
  emailAddress: string,
  kitApiKey: string,
  tags?: KitTag[]
): Promise<void> {
  const requestBody: KitSubscriberRequestBody = {
    email_address: emailAddress,
    ...(tags && tags.length > 0 && { tags }),
  };

  const response = await fetch("https://api.kit.com/v4/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitApiKey,
    },
    body: JSON.stringify(requestBody),
  });

  // 200/201/202 are fine; 4xx/5xx we ignore but do not throw to avoid retries storm
  if (!response.ok) {
    console.error("Kit upsert subscriber failed:", {
      status: response.status,
      statusText: response.statusText,
      email: emailAddress,
      timestamp: new Date().toISOString(),
    });
  }
}

async function kitGetTagIdByName(
  tagName: string,
  kitApiKey: string
): Promise<number | null> {
  if (kitTagIdCache[tagName] !== undefined) return kitTagIdCache[tagName];
  try {
    const response = await kitFetch("https://api.kit.com/v4/tags", {
      method: "GET",
      headers: {
        "X-Kit-Api-Key": kitApiKey,
      },
    });

    if (!response.ok) {
      console.error("Kit list tags failed:", {
        status: response.status,
        statusText: response.statusText,
        tagName,
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    const data: KitTagsResponse = await response
      .json()
      .catch(() => ({} as KitTagsResponse));
    const tags: KitTagWithId[] = data?.tags ?? [];
    const matchingTag = tags.find((tag) => tag.name === tagName);

    if (!matchingTag) {
      console.error("Kit tag not found:", {
        tagName,
        availableTags: tags.map((t) => t.name),
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    if (matchingTag?.id !== undefined) {
      kitTagIdCache[tagName] = matchingTag.id;
      return matchingTag.id;
    }
    return null;
  } catch (error) {
    console.error("Kit get tag ID failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      tagName,
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

async function kitAddTagToSubscriber(
  emailAddress: string,
  tagName: string,
  kitApiKey: string
): Promise<void> {
  // First get the tag ID
  const tagId = await kitGetTagIdByName(tagName, kitApiKey);
  if (!tagId) {
    console.error("Kit tag ID not found for tagging:", {
      email: emailAddress,
      tagName,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Find subscriber by email via list filter
  const listResponse = await kitFetch(
    `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(
      emailAddress
    )}&limit=1`,
    {
      method: "GET",
      headers: {
        "X-Kit-Api-Key": kitApiKey,
      },
    }
  );

  if (!listResponse.ok) {
    console.error("Kit list subscribers failed:", {
      status: listResponse.status,
      statusText: listResponse.statusText,
      email: emailAddress,
      tagName,
      timestamp: new Date().toISOString(),
    });
    return; // best-effort; treat as no-op
  }

  const listData: KitListResponse = await listResponse
    .json()
    .catch(() => ({} as KitListResponse));
  const subscribers: KitSubscriber[] = listData?.subscribers ?? [];
  const match = subscribers.find(
    (s) => (s?.email_address ?? "").toLowerCase() === emailAddress.toLowerCase()
  );

  if (!match?.id) {
    console.error("Kit subscriber not found for tagging:", {
      email: emailAddress,
      tagName,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Add tag using the correct Kit API endpoint
  const tagResponse = await kitFetch(
    `https://api.kit.com/v4/tags/${tagId}/subscribers/${match.id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": kitApiKey,
      },
      body: JSON.stringify({}),
    }
  );

  if (!tagResponse.ok) {
    console.error("Kit add tag failed:", {
      status: tagResponse.status,
      statusText: tagResponse.statusText,
      email: emailAddress,
      tagName,
      tagId,
      subscriberId: match.id,
      timestamp: new Date().toISOString(),
    });
  }
}

async function kitRemoveTagFromSubscriber(
  emailAddress: string,
  tagName: string,
  kitApiKey: string
): Promise<void> {
  // First get the tag ID
  const tagId = await kitGetTagIdByName(tagName, kitApiKey);
  if (!tagId) {
    console.error("Kit tag ID not found for removal:", {
      email: emailAddress,
      tagName,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Find subscriber by email via list filter
  const listResponse = await kitFetch(
    `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(
      emailAddress
    )}&limit=1`,
    {
      method: "GET",
      headers: {
        "X-Kit-Api-Key": kitApiKey,
      },
    }
  );

  if (!listResponse.ok) {
    return; // best-effort; treat as no-op
  }

  const listData: KitListResponse = await listResponse
    .json()
    .catch(() => ({} as KitListResponse));
  const subscribers: KitSubscriber[] = listData?.subscribers ?? [];
  const match = subscribers.find(
    (s) => (s?.email_address ?? "").toLowerCase() === emailAddress.toLowerCase()
  );

  if (!match?.id) return;

  // Remove tag using the correct Kit API endpoint
  const removeResponse = await kitFetch(
    `https://api.kit.com/v4/tags/${tagId}/subscribers/${match.id}`,
    {
      method: "DELETE",
      headers: {
        "X-Kit-Api-Key": kitApiKey,
      },
    }
  );

  if (!removeResponse.ok) {
    console.error("Kit remove tag failed:", {
      status: removeResponse.status,
      statusText: removeResponse.statusText,
      email: emailAddress,
      tagName,
      tagId,
      subscriberId: match.id,
      timestamp: new Date().toISOString(),
    });
  }
}

async function kitUnsubscribeByEmail(
  emailAddress: string,
  kitApiKey: string
): Promise<void> {
  // Find subscriber by email via list filter
  const listResponse = await kitFetch(
    `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(
      emailAddress
    )}&limit=1`,
    {
      method: "GET",
      headers: {
        "X-Kit-Api-Key": kitApiKey,
      },
    }
  );

  if (!listResponse.ok) {
    console.error("Kit list subscribers failed for unsubscribe:", {
      status: listResponse.status,
      statusText: listResponse.statusText,
      email: emailAddress,
      timestamp: new Date().toISOString(),
    });
    return; // best-effort; treat as no-op
  }

  const listData: KitListResponse = await listResponse
    .json()
    .catch(() => ({} as KitListResponse));
  const subscribers: KitSubscriber[] = listData?.subscribers ?? [];
  const match = subscribers.find(
    (s) => (s?.email_address ?? "").toLowerCase() === emailAddress.toLowerCase()
  );

  if (!match?.id) {
    console.error("Kit subscriber not found for unsubscribe:", {
      email: emailAddress,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const unsubResponse = await kitFetch(
    `https://api.kit.com/v4/subscribers/${match.id}/unsubscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": kitApiKey,
      },
      body: JSON.stringify({}),
    }
  );

  if (!unsubResponse.ok) {
    // best-effort
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 400 }
      );
    }

    const clerkSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!clerkSecret) {
      return NextResponse.json(
        { error: "Server misconfigured: missing CLERK_WEBHOOK_SECRET" },
        { status: 500 }
      );
    }

    const webhook = new Webhook(clerkSecret);
    let evt: WebhookEvent;
    try {
      evt = webhook.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { type, data } = evt;

    const kitApiKey = process.env.KIT_API_KEY;
    if (!kitApiKey) {
      return NextResponse.json(
        { error: "Server misconfigured: missing KIT_API_KEY" },
        { status: 500 }
      );
    }

    switch (type) {
      case "user.created": {
        if (hasEmailShape(data)) {
          const emailAddress = getPrimaryEmailAddress(data);
          if (emailAddress) {
            // First create the subscriber without tags
            await kitUpsertSubscriberByEmail(emailAddress, kitApiKey);
            // Then add the Free Subscriber tag separately (after successful creation)
            await kitAddTagToSubscriber(
              emailAddress,
              KIT_SUBSCRIBER_TAGS.FREE_SUBSCRIBER,
              kitApiKey
            );
          }
        }
        break;
      }
      case "user.updated": {
        if (hasEmailShape(data)) {
          const emailAddress = getPrimaryEmailAddress(data);
          if (emailAddress) {
            // Ensure subscriber exists
            await kitUpsertSubscriberByEmail(emailAddress, kitApiKey);

            // Toggle tags based on Clerk public_metadata.isSubscribed
            const isSubscribed = Boolean(
              (data as ClerkUserEventData)?.public_metadata?.isSubscribed
            );

            if (isSubscribed) {
              // Becoming or remaining paid: add PAID, remove FORMER and FREE
              await kitAddTagToSubscriber(
                emailAddress,
                KIT_SUBSCRIBER_TAGS.PAID_SUBSCRIBER,
                kitApiKey
              );
              await kitRemoveTagFromSubscriber(
                emailAddress,
                KIT_SUBSCRIBER_TAGS.FORMER_SUBSCRIBER,
                kitApiKey
              );
              await kitRemoveTagFromSubscriber(
                emailAddress,
                KIT_SUBSCRIBER_TAGS.FREE_SUBSCRIBER,
                kitApiKey
              );
            } else {
              // Not subscribed: remove PAID and keep only FORMER_SUBSCRIBER
              await kitRemoveTagFromSubscriber(
                emailAddress,
                KIT_SUBSCRIBER_TAGS.PAID_SUBSCRIBER,
                kitApiKey
              );
              await kitAddTagToSubscriber(
                emailAddress,
                KIT_SUBSCRIBER_TAGS.FORMER_SUBSCRIBER,
                kitApiKey
              );
            }
          }
        }
        break;
      }
      case "user.deleted": {
        if (hasEmailShape(data)) {
          const emailAddress = getPrimaryEmailAddress(data);
          if (emailAddress) {
            await kitUnsubscribeByEmail(emailAddress, kitApiKey);
          }
        }
        break;
      }
      default:
        // No-op for other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
