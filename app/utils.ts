import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidData = (data: string | null): boolean => {
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
