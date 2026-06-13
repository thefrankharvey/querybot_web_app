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
import {
  syncAgentMetadataToClerk,
  syncWriterMetadataToClerk,
} from "@/lib/clerk-utils";

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

function getAgentId(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isAgentAccountEvent(data: ClerkUserEventData): boolean {
  return (
    data.public_metadata?.accountType === "agent" ||
    data.public_metadata?.isAgent === true ||
    (data.public_metadata?.accountType !== "writer" &&
      data.unsafe_metadata?.accountType === "agent")
  );
}

function shouldPromoteAgentMetadata(data: ClerkUserEventData): boolean {
  const agentId = getAgentId(data.unsafe_metadata?.agentId);

  if (
    data.public_metadata?.accountType === "writer" ||
    data.unsafe_metadata?.accountType !== "agent" ||
    !agentId
  ) {
    return false;
  }

  return (
    data.public_metadata?.accountType !== "agent" ||
    data.public_metadata?.isAgent !== true ||
    data.public_metadata?.agentId !== agentId
  );
}

async function syncAgentMetadataFromClerkEvent(
  data: ClerkUserEventData
): Promise<void> {
  const agentId = getAgentId(data.unsafe_metadata?.agentId);

  if (!agentId || !shouldPromoteAgentMetadata(data)) return;

  if (!data.id) {
    console.error("[clerk-webhook] Agent user event missing Clerk user id", {
      agentId,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const result = await syncAgentMetadataToClerk(data.id, agentId);

  if (!result.success) {
    console.error("[clerk-webhook] Failed to promote agent metadata", {
      userId: data.id,
      agentId,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  }
}

function shouldPromoteWriterMetadata(data: ClerkUserEventData): boolean {
  return (
    data.unsafe_metadata?.accountType === "writer" &&
    data.public_metadata?.accountType !== "agent" &&
    data.public_metadata?.isAgent !== true &&
    data.public_metadata?.accountType !== "writer"
  );
}

async function syncWriterMetadataFromClerkEvent(
  data: ClerkUserEventData
): Promise<void> {
  if (!shouldPromoteWriterMetadata(data)) return;

  if (!data.id) {
    console.error("[clerk-webhook] Writer user event missing Clerk user id", {
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const result = await syncWriterMetadataToClerk(data.id);

  if (!result.success) {
    console.error("[clerk-webhook] Failed to promote writer metadata", {
      userId: data.id,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  }
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

    switch (type) {
      case "user.created": {
        const userData = data as ClerkUserEventData;

        if (isAgentAccountEvent(userData)) {
          await syncAgentMetadataFromClerkEvent(userData);
          break;
        }

        await syncWriterMetadataFromClerkEvent(userData);

        if (!kitApiKey) {
          return NextResponse.json(
            { error: "Server misconfigured: missing KIT_API_KEY" },
            { status: 500 }
          );
        }

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
        const userData = data as ClerkUserEventData;

        if (isAgentAccountEvent(userData)) {
          await syncAgentMetadataFromClerkEvent(userData);
          break;
        }

        await syncWriterMetadataFromClerkEvent(userData);

        if (!kitApiKey) {
          return NextResponse.json(
            { error: "Server misconfigured: missing KIT_API_KEY" },
            { status: 500 }
          );
        }

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
        const userData = data as ClerkUserEventData;

        if (isAgentAccountEvent(userData)) {
          break;
        }

        if (!kitApiKey) {
          return NextResponse.json(
            { error: "Server misconfigured: missing KIT_API_KEY" },
            { status: 500 }
          );
        }

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
