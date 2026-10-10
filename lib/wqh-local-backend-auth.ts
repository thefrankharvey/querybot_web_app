import "server-only";

export function isLocalBackendTestingEndpoint(endpoint: string): boolean {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.WQH_LOCAL_BACKEND_TESTING !== "true"
  ) {
    return false;
  }

  try {
    const url = new URL(endpoint);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      !url.username && !url.password
    );
  } catch {
    return false;
  }
}

export function getLocalVocabularyWriteHeaders(
  endpoint: string,
): Record<string, string> {
  if (!isLocalBackendTestingEndpoint(endpoint)) return {};
  const token = process.env.WQH_VOCAB_WRITE_TOKEN?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
