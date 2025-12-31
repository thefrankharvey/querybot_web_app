import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateUserSubscriptionStatus } from "@/app/actions/clerk-actions";

// Check for required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature for security
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Keep Stripe webhook focused on updating Clerk only

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Get the customer to find the Clerk user ID
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );

        if (customer.deleted) {
          // Customer already deleted - nothing we can do, acknowledge the webhook
          console.log("Customer was deleted, acknowledging webhook");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const clerkUserId = customer.metadata?.clerkUserId;

        if (!clerkUserId) {
          // No Clerk user ID - can't update, but acknowledge to prevent retries
          console.error("No Clerk user ID found in customer metadata");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Check if subscription is active
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        // Update Clerk user metadata
        const result = await updateUserSubscriptionStatus(
          clerkUserId,
          isActive
        );

        if (!result.success) {
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Get the customer to find the Clerk user ID
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );

        if (customer.deleted) {
          // Customer already deleted - nothing we can do, acknowledge the webhook
          console.error("Customer was deleted, acknowledging webhook");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const clerkUserId = customer.metadata?.clerkUserId;

        if (!clerkUserId) {
          // No Clerk user ID - can't update, but acknowledge to prevent retries
          console.error("No Clerk user ID found in customer metadata");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const result = await updateUserSubscriptionStatus(clerkUserId, false);

        if (!result.success) {
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
          );
        }

        break;
      }

      // Note: invoice.payment_failed handling can be added later if needed
      // Stripe will handle payment retries and eventually cancel subscription if payments fail

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
