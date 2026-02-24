import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateUserSubscriptionStatus } from "@/lib/clerk-utils";
import { getStripeSecretKey, getStripeWebhookSecret } from "@/lib/config";

export const runtime = "nodejs";

let _stripe: Stripe | null = null;
let _webhookSecret: string | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: "2025-06-30.basil",
    });
  }
  return _stripe;
}

function getWebhookSecret(): string {
  if (!_webhookSecret) {
    _webhookSecret = getStripeWebhookSecret();
  }
  return _webhookSecret;
}

async function resolveClerkUserId(
  stripe: Stripe,
  customerId: string,
): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) {
    console.error("Customer was deleted, cannot resolve clerkUserId");
    return null;
  }

  return customer.metadata?.clerkUserId || null;
}

export async function POST(req: NextRequest) {
  console.log("[stripe-webhook] POST handler invoked");

  let stripe: Stripe;
  let webhookSecret: string;

  try {
    stripe = getStripe();
    webhookSecret = getWebhookSecret();
  } catch (error) {
    console.error("[stripe-webhook] Failed to initialize Stripe:", error);
    return NextResponse.json(
      { error: "Stripe initialization failed" },
      { status: 500 },
    );
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("[stripe-webhook] Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("[stripe-webhook] Signature verification failed:", error);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    console.log("[stripe-webhook] event.type:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserId = await resolveClerkUserId(
          stripe,
          subscription.customer as string,
        );

        if (!clerkUserId) {
          console.error(
            "[stripe-webhook] No clerkUserId for subscription event",
          );
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        console.log(
          `[stripe-webhook] Updating user ${clerkUserId} isSubscribed=${isActive}`,
        );

        const result = await updateUserSubscriptionStatus(
          clerkUserId,
          isActive,
        );

        if (!result.success) {
          console.error(
            "[stripe-webhook] Failed to update Clerk metadata:",
            result.error,
          );
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 },
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserId = await resolveClerkUserId(
          stripe,
          subscription.customer as string,
        );

        if (!clerkUserId) {
          console.error(
            "[stripe-webhook] No clerkUserId for subscription.deleted event",
          );
          return NextResponse.json({ received: true }, { status: 200 });
        }

        console.log(
          `[stripe-webhook] Deactivating subscription for user ${clerkUserId}`,
        );

        const result = await updateUserSubscriptionStatus(clerkUserId, false);

        if (!result.success) {
          console.error(
            "[stripe-webhook] Failed to update Clerk metadata:",
            result.error,
          );
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 },
          );
        }

        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription" || !session.subscription) {
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const clerkUserId = await resolveClerkUserId(
          stripe,
          sub.customer as string,
        );

        if (!clerkUserId) {
          console.error(
            "[stripe-webhook] No clerkUserId for checkout.session.completed",
          );
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const isActive =
          sub.status === "active" || sub.status === "trialing";

        console.log(
          `[stripe-webhook] checkout.session.completed - updating user ${clerkUserId} isSubscribed=${isActive}`,
        );

        const result = await updateUserSubscriptionStatus(
          clerkUserId,
          isActive,
        );

        if (!result.success) {
          console.error(
            "[stripe-webhook] Failed to update Clerk metadata from checkout:",
            result.error,
          );
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 },
          );
        }

        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[stripe-webhook] Handler failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
