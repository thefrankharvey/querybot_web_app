export const TRAIT_TYPES = ["genre", "subgenre", "theme", "format"] as const;
export const TRAITS_QUERY_KEY = ["manuscript-traits"] as const;

export type TraitType = (typeof TRAIT_TYPES)[number];

export type TraitOption = {
  value: string;
  label: string;
  keywords?: string[];
};

export type TraitGroups = Record<TraitType, string[]>;

export type ManuscriptTrait = {
  id: string | number;
  trait_type: TraitType;
  trait_value: string;
  created_at: string;
  updated_at?: string;
};

const EMPTY_TRAIT_GROUPS: TraitGroups = {
  genre: [],
  subgenre: [],
  theme: [],
  format: [],
};

export const TRAIT_SANITIZER_EXAMPLES = [
  {
    type: "genre",
    input: "Literary Fiction",
    output: "literary-fiction",
  },
  {
    type: "genre",
    input: "Women\u2019s Fiction",
    output: "womens-fiction",
  },
  {
    type: "subgenre",
    input: "LGBTQ+ Sci Fi",
    output: "lgbtq+-sci-fi",
  },
  {
    type: "format",
    input: "Graphic Novel",
    output: "graphic_novel",
  },
] as const satisfies ReadonlyArray<{
  type: TraitType;
  input: string;
  output: string;
}>;

export function isTraitType(value: unknown): value is TraitType {
  return typeof value === "string" && TRAIT_TYPES.includes(value as TraitType);
}

export function normalizeTraitGroups(traits: Partial<TraitGroups>): TraitGroups {
  return {
    genre: normalizeTraitList(traits.genre),
    subgenre: normalizeTraitList(traits.subgenre),
    theme: normalizeTraitList(traits.theme),
    format: normalizeTraitList(traits.format),
  };
}

export function addTraitToGroups(
  groups: TraitGroups | undefined,
  type: TraitType,
  value: string,
): TraitGroups {
  const normalizedGroups = normalizeTraitGroups(groups ?? EMPTY_TRAIT_GROUPS);
  const nextValues = new Set(normalizedGroups[type]);
  nextValues.add(value);

  return {
    ...normalizedGroups,
    [type]: Array.from(nextValues).sort((left, right) =>
      left.localeCompare(right),
    ),
  };
}

export function sanitizeTraitValue(type: TraitType, rawValue: string): string {
  const normalizedValue = rawValue
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/&/g, " and ")
    .trim()
    .toLocaleLowerCase();

  if (type === "format") {
    return normalizedValue
      .replace(/'/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  if (type === "subgenre") {
    return normalizedValue
      .replace(/[^a-z0-9+']+/g, "-")
      .replace(/-+/g, "-")
      .replace(/-\+/g, "+")
      .replace(/'+/g, "'")
      .split("-")
      .map((part) => part.replace(/^'+|'+$/g, ""))
      .filter(Boolean)
      .join("-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  return normalizedValue
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSanitizedTraitValue(value: string): boolean {
  return /[a-z0-9]/.test(value);
}

export function findExistingTraitValue(
  type: TraitType,
  value: string,
  existingValues: string[],
): string | null {
  const inputKeys = getTraitComparisonKeys(type, value);

  for (const existingValue of existingValues) {
    const existingKeys = getTraitComparisonKeys(type, existingValue);

    for (const key of inputKeys) {
      if (existingKeys.has(key)) {
        return existingValue;
      }
    }
  }

  return null;
}

export function formatTraitLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^lgbtq/i.test(word)) return word.toLocaleUpperCase();
      if (word === "ya") return "YA";
      if (word === "mg") return "MG";
      if (word === "sci") return "Sci";

      return word.charAt(0).toLocaleUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function toTraitOptions(values: string[]): TraitOption[] {
  return values.map(toTraitOption);
}

export function mergeTraitOptions(
  options: TraitOption[],
  selectedValues: string[],
): TraitOption[] {
  const seen = new Set(options.map((option) => option.value));
  const merged = [...options];

  for (const value of selectedValues) {
    if (!value || seen.has(value)) continue;

    seen.add(value);
    merged.push(toTraitOption(value));
  }

  return merged;
}

export function resolveTraitValues(
  type: TraitType,
  rawValues: string[],
  optionsOrValues: TraitOption[] | string[],
): string[] {
  const optionValues = optionsOrValues.map((optionOrValue) =>
    typeof optionOrValue === "string" ? optionOrValue : optionOrValue.value,
  );
  const resolvedValues: string[] = [];
  const seenKeys = new Set<string>();

  for (const rawValue of rawValues) {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) continue;

    const resolvedValue =
      findExistingTraitValue(type, trimmedValue, optionValues) ?? trimmedValue;
    const key = getTraitDedupKey(type, resolvedValue);

    if (seenKeys.has(key)) continue;

    seenKeys.add(key);
    resolvedValues.push(resolvedValue);
  }

  return resolvedValues;
}

export function toTraitOption(value: string): TraitOption {
  const label = formatTraitLabel(value);

  return {
    value,
    label,
    keywords: getTraitSearchKeywords(value, label),
  };
}

export function getTraitSearchKeywords(value: string, label: string): string[] {
  const keywords = new Set<string>();

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      keywords.add(trimmedKeyword);
    }
  };

  const addKeywordVariants = (keyword: string) => {
    addKeyword(keyword);
    addKeyword(keyword.toLocaleLowerCase());

    const normalizedKeyword = normalizeTraitSearchKeyword(keyword);
    addKeyword(normalizedKeyword);

    for (const variant of getPossessiveSearchVariants(normalizedKeyword)) {
      addKeyword(variant);
    }

    for (const variant of getSlashSearchVariants(normalizedKeyword)) {
      addKeyword(variant);
    }

    for (const variant of getSeparatorSearchVariants(normalizedKeyword)) {
      addKeyword(variant);
    }
  };

  addKeywordVariants(value);
  addKeywordVariants(label);
  addKeywordVariants(value.replace(/[_-]+/g, " "));

  return Array.from(keywords);
}

export function validateTraitSanitizerExamples(): string[] {
  return TRAIT_SANITIZER_EXAMPLES.flatMap((example) => {
    const actual = sanitizeTraitValue(example.type, example.input);

    return actual === example.output
      ? []
      : [
          `${example.type}: expected ${example.output} for ${example.input}, got ${actual}`,
        ];
  });
}

function normalizeTraitSearchKeyword(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/&/g, " and ")
    .toLocaleLowerCase()
    .replace(/'/g, "")
    .replace(/[+/_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPossessiveSearchVariants(value: string): string[] {
  const variants = new Set<string>();
  const possessiveValue = value
    .replace(/\bwomens\b/g, "women's")
    .replace(/\bchildrens\b/g, "children's")
    .replace(/\bmens\b/g, "men's");

  if (possessiveValue !== value) {
    variants.add(possessiveValue);
    variants.add(possessiveValue.replace(/'/g, "\u2019"));
  }

  return Array.from(variants);
}

function getSlashSearchVariants(value: string): string[] {
  const parts = value.split(" ").filter(Boolean);
  if (parts.length < 2) return [];

  return parts.slice(0, -1).map((_, index) => {
    const variantParts = [...parts];
    variantParts.splice(index, 2, `${parts[index]}/${parts[index + 1]}`);
    return variantParts.join(" ");
  });
}

function getSeparatorSearchVariants(value: string): string[] {
  const parts = value.split(" ").filter(Boolean);
  if (parts.length < 2) return [];

  return [parts.join("-"), parts.join("_")];
}

function normalizeTraitList(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(values.filter((value): value is string => typeof value === "string")),
  ).sort((left, right) => left.localeCompare(right));
}

function getTraitComparisonKeys(type: TraitType, value: string): Set<string> {
  const sanitizedValue = sanitizeTraitValue(type, value);
  const baseKey = sanitizedValue
    .replace(/_/g, "-")
    .replace(/'/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const keys = new Set<string>();
  if (baseKey) keys.add(baseKey);

  const singularKey = baseKey
    .split("-")
    .map(singularizeToken)
    .join("-");

  if (singularKey) keys.add(singularKey);

  return keys;
}

function getTraitDedupKey(type: TraitType, value: string): string {
  return (
    getTraitComparisonKeys(type, value).values().next().value ??
    normalizeTraitSearchKeyword(value)
  );
}

function singularizeToken(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.endsWith("ss")) return token;
  if (token.endsWith("s")) return token.slice(0, -1);

  return token;
}
