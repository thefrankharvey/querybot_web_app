"use client";

import { useUser } from "@clerk/nextjs";

import { useManuscriptTraits } from "@/app/hooks/use-manuscript-traits";

export function TraitsCacheWarmer() {
  const { isLoaded, isSignedIn } = useUser();

  useManuscriptTraits({
    enabled: isLoaded && isSignedIn,
  });

  return null;
}
