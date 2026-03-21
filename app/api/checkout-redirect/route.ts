import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient, syncStripeCustomerToClerk } from "@/lib/clerk-utils";
import {
  createStripeCustomer,
  createSubscriptionSession,
} from "@/app/actions/stripe-actions";
import { getStripePriceId } from "@/lib/config";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-up", request.url));
  }

  const url = new URL(request.url);
  const planParam = url.searchParams.get("plan");
  const plan: "monthly" | "yearly" =
    planParam === "yearly" ? "yearly" : "monthly";

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.redirect(
        new URL("/subscribe-public?error=missing_email", request.url),
      );
    }

    const priceId = getStripePriceId(plan);

    const customerResult = await createStripeCustomer(userId, email);
    if (!customerResult.success || !customerResult.customerId) {
      return NextResponse.redirect(
        new URL("/subscribe-public?error=checkout_failed", request.url),
      );
    }

    const syncResult = await syncStripeCustomerToClerk(
      userId,
      customerResult.customerId,
    );
    if (!syncResult.success) {
      return NextResponse.redirect(
        new URL("/subscribe-public?error=checkout_failed", request.url),
      );
    }

    const sessionResult = await createSubscriptionSession(
      customerResult.customerId,
      priceId,
    );
    if (!sessionResult.success || !sessionResult.url) {
      return NextResponse.redirect(
        new URL("/subscribe-public?error=checkout_failed", request.url),
      );
    }

    return NextResponse.redirect(sessionResult.url);
  } catch (error) {
    console.error("Checkout redirect error:", error);
    return NextResponse.redirect(
      new URL("/subscribe-public?error=checkout_failed", request.url),
    );
  }
}
