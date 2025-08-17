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
} from "@/app/types";
import { KIT_SUBSCRIBER_TAGS } from "@/app/constants";

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
    // Best-effort only; do not log per requirements
  }
}

async function kitAddTagToSubscriber(
  emailAddress: string,
  tagName: string,
  kitApiKey: string
): Promise<void> {
  // Find subscriber by email via list filter
  const listResponse = await fetch(
    `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(
      emailAddress
    )}`,
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

  interface KitSubscriber {
    id: number | string;
    email_address: string;
  }
  interface KitListResponse {
    subscribers?: KitSubscriber[];
  }

  const listData: KitListResponse = await listResponse
    .json()
    .catch(() => ({} as KitListResponse));
  const subscribers: KitSubscriber[] = listData?.subscribers ?? [];
  const match = subscribers.find(
    (s) => (s?.email_address ?? "").toLowerCase() === emailAddress.toLowerCase()
  );

  if (!match?.id) return;

  // Add tag
  await fetch(`https://api.kit.com/v4/subscribers/${match.id}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitApiKey,
    },
    body: JSON.stringify({ name: tagName }),
  });
}

async function kitRemoveTagFromSubscriber(
  emailAddress: string,
  tagName: string,
  kitApiKey: string
): Promise<void> {
  // Find subscriber by email via list filter
  const listResponse = await fetch(
    `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(
      emailAddress
    )}`,
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

  // Remove tag
  await fetch(`https://api.kit.com/v4/subscribers/${match.id}/tags`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitApiKey,
    },
    body: JSON.stringify({ name: tagName }),
  });
}

async function kitUnsubscribeByEmail(
  emailAddress: string,
  kitApiKey: string
): Promise<void> {
  // Find subscriber by email via list filter
  const listResponse = await fetch(
    `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(
      emailAddress
    )}`,
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

  interface KitSubscriber {
    id: number | string;
    email_address: string;
  }
  interface KitListResponse {
    subscribers?: KitSubscriber[];
  }

  const listData: KitListResponse = await listResponse
    .json()
    .catch(() => ({} as KitListResponse));
  const subscribers: KitSubscriber[] = listData?.subscribers ?? [];
  const match = subscribers.find(
    (s) => (s?.email_address ?? "").toLowerCase() === emailAddress.toLowerCase()
  );

  if (!match?.id) return;

  const unsubResponse = await fetch(
    `https://api.kit.com/v4/subscribers/${match.id}/unsubscribe`,
    {
      method: "POST",
      headers: {
        "X-Kit-Api-Key": kitApiKey,
      },
    }
  );

  if (!unsubResponse.ok) {
    // best-effort
  }
}

// Export Kit functions and constants for use in other webhooks
export {
  KIT_SUBSCRIBER_TAGS,
  kitAddTagToSubscriber,
  kitRemoveTagFromSubscriber,
};

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
            const tags: KitTag[] = [
              { name: KIT_SUBSCRIBER_TAGS.FREE_SUBSCRIBER },
            ];
            await kitUpsertSubscriberByEmail(emailAddress, kitApiKey, tags);
          }
        }
        break;
      }
      case "user.updated": {
        if (hasEmailShape(data)) {
          const emailAddress = getPrimaryEmailAddress(data);
          if (emailAddress) {
            // For user updates, sync to Kit without modifying tags
            await kitUpsertSubscriberByEmail(emailAddress, kitApiKey);
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
