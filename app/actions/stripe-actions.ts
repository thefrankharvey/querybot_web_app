"use server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function createStripeCustomer(userId: string, email: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        clerkUserId: userId,
      },
    });

    return {
      success: true,
      customerId: customer.id,
    };
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

export async function createSubscriptionSession(
  customerId: string,
  priceId: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/subscription?success=true`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/subscription?canceled=true`,
      metadata: {
        customerId,
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Error creating subscription session:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subscription session",
    };
  }
}
