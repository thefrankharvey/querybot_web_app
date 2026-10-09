import "server-only";

export function getLocalVocabularyWriteHeaders(
  endpoint: string,
): Record<string, string> {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.WQH_LOCAL_BACKEND_TESTING !== "true"
  ) {
    return {};
  }

  const token = process.env.WQH_VOCAB_WRITE_TOKEN?.trim();
  if (!token) return {};

  try {
    const url = new URL(endpoint);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    ) {
      return {};
    }
  } catch {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}
