export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      accountType?: "writer" | "agent";
      isSubscribed?: boolean;
      isAgent?: boolean;
      agentId?: string;
    };
  }

  interface UserPublicMetadata {
    accountType?: "writer" | "agent";
    isSubscribed?: boolean;
    isAgent?: boolean;
    agentId?: string;
  }

  interface UserUnsafeMetadata {
    accountType?: "writer" | "agent";
    isAgent?: boolean;
    agentId?: string;
  }

  interface UserPrivateMetadata {
    stripeCustomerId?: string;
  }
}
