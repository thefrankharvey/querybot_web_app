export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      isSubscribed?: boolean;
    };
  }

  interface UserPublicMetadata {
    isSubscribed?: boolean;
  }

  interface UserPrivateMetadata {
    stripeCustomerId?: string;
  }
}
