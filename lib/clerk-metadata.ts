export type AccountType = "writer" | "agent";

type ClerkMetadata = {
  accountType?: AccountType;
  isAgent?: boolean;
  agentId?: string;
};

type ClerkUserWithAgentMetadata = {
  publicMetadata?: ClerkMetadata;
  unsafeMetadata?: ClerkMetadata;
} | null | undefined;

function isAccountType(value: unknown): value is AccountType {
  return value === "writer" || value === "agent";
}

function normalizeAgentId(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getAccountMetadata(user: ClerkUserWithAgentMetadata) {
  const publicMetadata = user?.publicMetadata;
  const unsafeMetadata = user?.unsafeMetadata;
  const publicAccountType = isAccountType(publicMetadata?.accountType)
    ? publicMetadata.accountType
    : null;
  const unsafeAccountType = isAccountType(unsafeMetadata?.accountType)
    ? unsafeMetadata.accountType
    : null;
  const accountType = publicAccountType ?? "writer";
  const canPromoteAgentSignup =
    publicAccountType !== "writer" && unsafeAccountType === "agent";
  const agentId =
    normalizeAgentId(publicMetadata?.agentId) ??
    (canPromoteAgentSignup ? normalizeAgentId(unsafeMetadata?.agentId) : null);

  return {
    accountType,
    isAgent: accountType === "agent",
    agentId,
    canPromoteAgentSignup,
    unsafeAccountType,
  };
}

export function getAgentMetadata(user: ClerkUserWithAgentMetadata) {
  const { isAgent, agentId } = getAccountMetadata(user);

  return {
    isAgent,
    agentId,
  };
}
