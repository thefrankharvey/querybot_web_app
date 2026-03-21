import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { clerkClient, updateUserSubscriptionStatus } from "@/lib/clerk-utils";
import { getStripeSecretKey } from "@/lib/config";

export const runtime = "nodejs";

const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: "2025-06-30.basil",
});

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata?.isSubscribed) {
      return NextResponse.json({ isSubscribed: true });
    }

    const stripeCustomerId = user.privateMetadata?.stripeCustomerId as
      | string
      | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json({ isSubscribed: false });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
    });

    const hasActive = subscriptions.data.length > 0;

    if (hasActive) {
      await updateUserSubscriptionStatus(userId, true);
    }

    return NextResponse.json({ isSubscribed: hasActive });
  } catch (error) {
    console.error("[verify-subscription] Error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    );
  }
}
