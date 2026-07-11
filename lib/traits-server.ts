import { dehydrate, QueryClient } from "@tanstack/react-query";

import { getWqhTraitsApiUrl } from "@/lib/config";
import {
  normalizeTraitGroups,
  TRAITS_QUERY_KEY,
  type TraitGroups,
} from "@/lib/traits";

type GetTraitsResponse =
  | {
      status: "success";
      traits: TraitGroups;
    }
  | {
      status: "success";
      traits: string[];
    }
  | {
      status: "error";
      message: string;
    };

export async function getTraitsDehydratedState() {
  const queryClient = new QueryClient();
  const traits = await fetchServerTraits();

  if (traits) {
    queryClient.setQueryData(TRAITS_QUERY_KEY, traits);
  }

  return dehydrate(queryClient);
}

async function fetchServerTraits(): Promise<TraitGroups | null> {
  try {
    const traitsApiBaseUrl = getWqhTraitsApiUrl().replace(/\/$/, "");
    const response = await fetch(`${traitsApiBaseUrl}/get-traits`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Server traits prefetch failed", {
        status: response.status,
      });
      return null;
    }

    const body = (await response.json()) as GetTraitsResponse;

    if (body.status !== "success" || Array.isArray(body.traits)) {
      return null;
    }

    return normalizeTraitGroups(body.traits);
  } catch (error) {
    console.warn("Server traits prefetch failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return null;
  }
}
