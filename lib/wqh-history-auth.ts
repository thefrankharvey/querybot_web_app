import "server-only";

type WriterEmailSource = {
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
};

export function getWriterEmail(user: WriterEmailSource): string | null {
  return (
    user.primaryEmailAddress?.emailAddress.trim() ||
    user.emailAddresses?.[0]?.emailAddress.trim() ||
    null
  );
}

export function getWqhHistoryHeaders(): { Authorization: string } | null {
  const key = process.env.WQH_HISTORY_API_KEY;
  if (!key?.trim()) return null;

  return { Authorization: `Bearer ${key}` };
}
