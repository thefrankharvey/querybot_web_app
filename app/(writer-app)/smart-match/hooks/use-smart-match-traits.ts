"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  formatOptions,
  genreOptions,
  subgenreOptions,
  themeOptions,
} from "@/app/constants";
import {
  addTraitToGroups,
  findExistingTraitValue,
  isValidSanitizedTraitValue,
  ManuscriptTrait,
  normalizeTraitGroups,
  sanitizeTraitValue,
  toTraitOptions,
  TraitGroups,
  TraitOption,
  TraitType,
} from "@/lib/traits";

const TRAITS_QUERY_KEY = ["smart-match-traits"] as const;

const FALLBACK_TRAITS: TraitGroups = {
  genre: genreOptions.map((option) => option.value),
  subgenre: subgenreOptions.map((option) => option.value),
  theme: themeOptions.map((option) => option.value),
  format: formatOptions.map((option) => option.value),
};

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

type CreateTraitResponse =
  | {
      status: "success";
      trait: ManuscriptTrait;
    }
  | {
      status: "error";
      message: string;
    };

type UnknownApiErrorResponse = {
  error?: string;
  message?: string;
  status?: string;
};

type AddTraitResult = {
  value: string;
  created: boolean;
  matchedExisting: boolean;
  sanitizedValue: string;
};

export type CreateOrSelectTrait = (
  type: TraitType,
  rawValue: string,
) => Promise<AddTraitResult>;

export function useSmartMatchTraits() {
  const queryClient = useQueryClient();
  const traitsQuery = useQuery({
    queryKey: TRAITS_QUERY_KEY,
    queryFn: fetchAllTraits,
    staleTime: 5 * 60 * 1000,
  });

  const traitValues = traitsQuery.data ?? FALLBACK_TRAITS;
  const traitOptions = useMemo<Record<TraitType, TraitOption[]>>(
    () => ({
      genre: toTraitOptions(traitValues.genre),
      subgenre: toTraitOptions(traitValues.subgenre),
      theme: toTraitOptions(traitValues.theme),
      format: toTraitOptions(traitValues.format),
    }),
    [traitValues],
  );

  const createTraitMutation = useMutation({
    mutationFn: createTrait,
  });

  const createOrSelectTrait = useCallback<CreateOrSelectTrait>(
    async (type, rawValue) => {
      const sanitizedValue = sanitizeTraitValue(type, rawValue);

      if (!isValidSanitizedTraitValue(sanitizedValue)) {
        throw new Error(`Enter a valid ${type}`);
      }

      const existingValue = findExistingTraitValue(
        type,
        sanitizedValue,
        traitValues[type],
      );

      if (existingValue) {
        return {
          value: existingValue,
          created: false,
          matchedExisting: true,
          sanitizedValue,
        };
      }

      const result = await createTraitMutation.mutateAsync({
        type,
        value: sanitizedValue,
      });

      if (!result.created) {
        const refreshedTraits = await refreshTraitGroups(queryClient);
        const refreshedExistingValue = findExistingTraitValue(
          type,
          sanitizedValue,
          refreshedTraits?.[type] ?? traitValues[type],
        );

        return {
          value: refreshedExistingValue ?? sanitizedValue,
          created: false,
          matchedExisting: true,
          sanitizedValue,
        };
      }

      const createdValue = result.trait.trait_value;
      queryClient.setQueryData<TraitGroups>(TRAITS_QUERY_KEY, (current) =>
        addTraitToGroups(current ?? traitValues, type, createdValue),
      );

      return {
        value: createdValue,
        created: true,
        matchedExisting: false,
        sanitizedValue,
      };
    },
    [createTraitMutation, queryClient, traitValues],
  );

  return {
    createOrSelectTrait,
    isCreatingTrait: createTraitMutation.isPending,
    isLoadingTraits: traitsQuery.isLoading,
    traitOptions,
    traitValues,
    traitsError: "",
  };
}

async function fetchAllTraits(): Promise<TraitGroups> {
  const response = await fetch("/api/traits", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const body = await readJsonResponse<GetTraitsResponse>(response);

  if (!response.ok || body.status === "error") {
    throw new Error(readApiMessage(body, "Failed to load traits"));
  }

  if (Array.isArray(body.traits)) {
    throw new Error("Expected grouped trait response");
  }

  return normalizeTraitGroups(body.traits);
}

async function createTrait(payload: {
  type: TraitType;
  value: string;
}): Promise<
  | { created: true; trait: ManuscriptTrait }
  | { created: false; reason: "already_exists" }
> {
  const response = await fetch("/api/traits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await readJsonResponse<CreateTraitResponse>(response);

  if (response.status === 201 && body.status === "success") {
    return { created: true, trait: body.trait };
  }

  if (response.status === 409) {
    return { created: false, reason: "already_exists" };
  }

  throw new Error(readApiMessage(body, "Failed to create trait"));
}

async function refreshTraitGroups(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  try {
    const traits = await fetchAllTraits();
    queryClient.setQueryData(TRAITS_QUERY_KEY, traits);
    return traits;
  } catch {
    await queryClient.invalidateQueries({ queryKey: TRAITS_QUERY_KEY });
    return null;
  }
}

function readApiMessage(
  body: GetTraitsResponse | CreateTraitResponse | UnknownApiErrorResponse,
  fallback: string,
) {
  if ("status" in body && body.status === "error" && body.message) {
    return body.message;
  }

  if ("error" in body && body.error) {
    return body.error;
  }

  if ("message" in body && body.message) {
    return body.message;
  }

  return fallback;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLocaleLowerCase().includes("application/json")) {
    throw new Error("Traits API returned a non-JSON response");
  }

  return (await response.json()) as T;
}
