import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidData = (data: string | null): boolean => {
  return data && data !== "!missing" ? true : false;
};
