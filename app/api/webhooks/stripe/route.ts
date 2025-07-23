import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateUserSubscriptionStatus } from "@/app/actions/clerk-actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    // Verify webhook signature for security
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

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
          console.error("Customer was deleted");
          return NextResponse.json(
            { error: "Customer not found" },
            { status: 404 }
          );
        }

        const clerkUserId = customer.metadata?.clerkUserId;

        if (!clerkUserId) {
          console.error("No Clerk user ID found in customer metadata");
          return NextResponse.json(
            { error: "Clerk user ID not found" },
            { status: 400 }
          );
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
          console.error(
            "Failed to update user subscription status:",
            result.error
          );
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
          );
        }

        console.log(
          `Subscription ${subscription.id} ${
            isActive ? "activated" : "deactivated"
          } for user ${clerkUserId}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Get the customer to find the Clerk user ID
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );

        if (customer.deleted) {
          console.error("Customer was deleted");
          return NextResponse.json(
            { error: "Customer not found" },
            { status: 404 }
          );
        }

        const clerkUserId = customer.metadata?.clerkUserId;

        if (!clerkUserId) {
          console.error("No Clerk user ID found in customer metadata");
          return NextResponse.json(
            { error: "Clerk user ID not found" },
            { status: 400 }
          );
        }

        // Deactivate subscription
        const result = await updateUserSubscriptionStatus(clerkUserId, false);

        if (!result.success) {
          console.error(
            "Failed to update user subscription status:",
            result.error
          );
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
          );
        }

        console.log(
          `Subscription ${subscription.id} canceled for user ${clerkUserId}`
        );
        break;
      }

      // Note: invoice.payment_failed handling can be added later if needed
      // Stripe will handle payment retries and eventually cancel subscription if payments fail

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
