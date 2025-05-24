import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// HELPER UTILS ========================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// QUERY FORM UTILS ========================================================

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

export const formatThemes = (themes: string) => {
  return themes.split(",").map((theme) => theme.trim());
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

// AGENT PROFILE UTILS ========================================================

export const isValidData = (data: string | null | undefined): boolean => {
  return data && data !== "!missing" ? true : false;
};

export const formatGenres = (genres: string) => {
  const result = [];
  const genresArray = genres.split(",");

  // List of strings to filter out
  const stringsToFilter = [
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
    "Non-fiction",
    "CLOSED to Submissions",
    "Authors and Illustrators Only",
  ];

  for (const genre of genresArray) {
    if (genre.includes("|")) {
      const genreArray = genre.split("|").filter((str) => {
        // Remove empty strings and whitespace-only strings
        if (!str.trim()) return false;

        // Check if it contains any number
        if (/\d/.test(str)) return false;

        // Check if it contains any string from the filter list
        if (stringsToFilter.some((filterStr) => str.includes(filterStr)))
          return false;

        // Check for symbols
        if (str.includes("•") || str.includes("@")) return false;

        return true;
      });
      result.push(...genreArray);
    } else {
      const trimmedGenre = genre.trim();
      if (
        trimmedGenre &&
        !/\d/.test(trimmedGenre) &&
        !stringsToFilter.some((filterStr) =>
          trimmedGenre.includes(filterStr)
        ) &&
        !trimmedGenre.includes("•") &&
        !trimmedGenre.includes("@")
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
