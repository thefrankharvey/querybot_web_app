export function normalizeAndDedup(values: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
  
    for (const raw of values) {
      const normalized = raw
        .replace(/[-_/]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
  
      if (!seen.has(normalized)) {
        seen.add(normalized);
        out.push(normalized);
      }
    }
  
    return out;
  }