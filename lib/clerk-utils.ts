import { createClerkClient } from "@clerk/backend";

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function syncStripeCustomerToClerk(
  userId: string,
  stripeCustomerId: string,
) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        stripeCustomerId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error syncing Stripe customer to Clerk:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to sync customer data",
    };
  }
}

export async function updateUserSubscriptionStatus(
  userId: string,
  isSubscribed: boolean,
) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        isSubscribed,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      `[clerk-utils] Failed to update subscription status for user ${userId}:`,
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update subscription status",
    };
  }
}

export async function syncAgentMetadataToClerk(
  userId: string,
  agentId: string,
) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        accountType: "agent",
        isAgent: true,
        agentId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      `[clerk-utils] Failed to update agent metadata for user ${userId}:`,
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to sync agent data",
    };
  }
}

export async function syncWriterMetadataToClerk(userId: string) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        accountType: "writer",
        isAgent: false,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      `[clerk-utils] Failed to update writer metadata for user ${userId}:`,
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to sync writer data",
    };
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await clerkClient.users.deleteUser(userId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete account",
    };
  }
}
