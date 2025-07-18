import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AgentMatch } from "./context/agent-matches-context";

// HELPER UTILS ========================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// QUERY FORM UTILS ========================================================

export type QueryPayload = {
  email: string;
  genre: string;
  subgenres: string[];
  format: string;
  target_audience: string;
  non_fiction: boolean; // TODO: add this back in when it's time
  comps?: string[];
  themes?: string[];
  synopsis?: string;
  manuscript?: string;
  enable_ai?: boolean; // TODO: add this back in when it's time
};

export const formatComps = (comps: { title: string; author: string }[]) => {
  const result = [];
  for (const comp of comps) {
    if (comp.title && comp.author) {
      result.push(comp.title);
      result.push(comp.author);
    }
  }
  return result;
};

// Required fields: email, genre, subgenres, target_audience, non_fiction, format

export const validateQuery = (payload: QueryPayload) => {
  const requiredFields = [
    { field: "email", label: "Email" },
    { field: "genre", label: "Genre" },
    { field: "subgenres", label: "Subgenres" },
    { field: "format", label: "Format" },
    { field: "target_audience", label: "Target audience" },
  ] as const;

  for (const { field, label } of requiredFields) {
    if (typeof payload[field] === "object" && payload[field].length === 0) {
      return { error: `${label} required`, isValid: false };
    }
    if (!payload[field]) {
      return { error: `${label} required`, isValid: false };
    }
  }

  return { error: null, isValid: true };
};

// LOCAL STORAGE UTILS ========================================================

export const getFromLocalStorage = (item: string) => {
  if (typeof window !== "undefined") {
    const retrievedItem = window.localStorage.getItem(item);
    if (retrievedItem) {
      try {
        return JSON.parse(retrievedItem);
      } catch (error) {
        // If JSON parsing fails, log the error and return empty object
        console.error("Failed to parse item from localStorage:", error);
        return {};
      }
    }
  }
  return {};
};

export const setInLocalStorage = (key: string, item: unknown) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(item));
  }
};

// CSV UTILS ========================================================

export const formatMatchesForCSV = (matches: AgentMatch[]) => {
  const result = matches
    .map((agent) => {
      const filteredEntries = Object.entries(agent).filter(
        ([key]) =>
          !key.includes("form_") &&
          !["aala_member", "id", "location", "agent_id"].includes(key)
      );
      return Object.fromEntries(filteredEntries) as Partial<AgentMatch>;
    })
    .map((agent) => {
      return {
        ...agent,
        genres: formatGenres(agent.genres || ""),
      };
    });

  return result;
};

// AGENT PROFILE UTILS ========================================================

export const isValidData = (data: string | null | undefined): boolean => {
  return data && data !== "!missing" ? true : false;
};

export const urlFormatter = (url: string | undefined | null) => {
  if (url?.includes("|")) {
    if (!url.split("|")[0].includes("http")) {
      return "http://" + url.split("|")[0];
    }
    return url.split("|")[0];
  }

  if (!url?.includes("http")) {
    return "http://" + url;
  }
  return url;
};

export const formatDisplayString = (data: string | undefined | null) => {
  if (!data) return data;
  return data.replace(/[|\/\\"']/g, "");
};

export const formatEmail = (email: string | undefined | null) => {
  if (!email) return [];
  return formatDisplayString(email)?.split(" ").filter(Boolean);
};

export const formatGenres = (genres: string) => {
  const result = [];
  const genresArray = genres.split(",");

  // List of strings to filter out
  const stringsToFilter = [
    "closed to submissions",
    "AALA member",
    "Accepting Submissions",
    "Member of",
    "Special Experience",
    "ORGANIZATIONS",
    "HONORS & MEDIA",
    "Forbes",
    "Jane Friedman's Blog",
    "Electric Literature",
    "Latino Leaders Magazine",
    "Minorities in Publishing",
    "in",
    "read more",
    "read less",
    "Sub-agents",
    "Rights contacts",
    "International Rights:",
    "Ellen K. Greenberg",
    "CLOSED to Submissions",
    "Authors and Illustrators Only",
  ];

  for (const genre of genresArray) {
    if (genre.includes("|")) {
      const genreArray = genre.split("|").filter((str) => {
        // Remove empty strings and whitespace-only strings
        if (!str.trim()) return false;

        // Check if it contains numbers, quotes, or unwanted symbols using regex
        if (/[\d•@"']/.test(str)) return false;

        // Check if it contains any string from the filter list
        if (stringsToFilter.some((filterStr) => str.includes(filterStr)))
          return false;

        return true;
      });
      result.push(...genreArray);
    } else {
      const trimmedGenre = genre.trim();
      if (
        trimmedGenre &&
        !/[\d•@"']/.test(trimmedGenre) &&
        !stringsToFilter.some((filterStr) => trimmedGenre.includes(filterStr))
      ) {
        result.push(trimmedGenre);
      }
    }
  }

  const uniqueResult: string[] = [];

  for (const genre of result) {
    if (!uniqueResult.includes(genre.trim())) {
      uniqueResult.push(genre.trim());
    }
  }

  return uniqueResult;
};
