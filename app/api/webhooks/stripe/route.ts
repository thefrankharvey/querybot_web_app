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

    // Debug logging for webhook debugging
    console.log("Webhook received:", {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      timestamp: new Date().toISOString(),
    });

    if (!signature) {
      console.error("No stripe-signature header found");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature for security
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(
        "Webhook signature verified successfully for event:",
        event.type
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", {
        error: err instanceof Error ? err.message : String(err),
        signatureLength: signature.length,
        bodyLength: body.length,
        webhookSecretPresent: !!webhookSecret,
      });
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // Handle different event types
        let customerId: string;
        let isActive: boolean;

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          if (
            session.mode !== "subscription" ||
            session.payment_status !== "paid"
          ) {
            break; // Skip non-subscription or unpaid sessions
          }
          customerId = session.customer as string;
          isActive = true; // Payment completed successfully
        } else {
          const subscription = event.data.object as Stripe.Subscription;
          customerId = subscription.customer as string;
          isActive =
            subscription.status === "active" ||
            subscription.status === "trialing";
        }

        // Get the customer to find the Clerk user ID
        const customer = await stripe.customers.retrieve(customerId);

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
          `${event.type} processed: ${
            isActive ? "activated" : "deactivated"
          } subscription for user ${clerkUserId}`
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
    console.error("Webhook handler error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
