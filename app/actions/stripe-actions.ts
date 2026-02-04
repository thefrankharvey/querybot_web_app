"use server";

import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/config";

const stripe = new Stripe(getStripeSecretKey(), {
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
      allow_promotion_codes: true, // This enables coupon code input on Stripe's checkout page
      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/saved-agents?payment=success`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/subscribe`,
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

export async function cancelCustomerSubscriptions(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    const cancelPromises = subscriptions.data.map((subscription) =>
      stripe.subscriptions.cancel(subscription.id)
    );

    await Promise.all(cancelPromises);

    return {
      success: true,
      canceledCount: subscriptions.data.length,
    };
  } catch (error) {
    console.error("Error canceling subscriptions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel subscriptions",
    };
  }
}

export async function deleteStripeCustomer(customerId: string) {
  try {
    await stripe.customers.del(customerId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting Stripe customer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete customer",
    };
  }
}
