import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidData = (data: string | null | undefined): boolean => {
  return data && data !== "!missing" ? true : false;
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

export const formatThemes = (themes: string) => {
  return themes.split(",").map((theme) => theme.trim());
};

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
