"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTraitToGroups,
  findExistingTraitValue,
  isValidSanitizedTraitValue,
  ManuscriptTrait,
  normalizeTraitGroups,
  sanitizeTraitValue,
  toTraitOptions,
  TRAITS_QUERY_KEY,
  TraitGroups,
  TraitOption,
  TraitType,
} from "@/lib/traits";

const EMPTY_TRAITS: TraitGroups = {
  genre: [],
  subgenre: [],
  theme: [],
  format: [],
};

const TRAITS_STALE_TIME_MS = 5 * 60 * 1000;
const TRAITS_GC_TIME_MS = 24 * 60 * 60 * 1000;

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

type UseManuscriptTraitsOptions = {
  enabled?: boolean;
};

export function useManuscriptTraits({
  enabled = true,
}: UseManuscriptTraitsOptions = {}) {
  const queryClient = useQueryClient();
  const traitsQuery = useQuery({
    queryKey: TRAITS_QUERY_KEY,
    queryFn: fetchAllTraits,
    enabled,
    staleTime: TRAITS_STALE_TIME_MS,
    gcTime: TRAITS_GC_TIME_MS,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const traitValues = traitsQuery.data ?? EMPTY_TRAITS;
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
    onMutate: async ({ type, value }) => {
      await queryClient.cancelQueries({ queryKey: TRAITS_QUERY_KEY });

      const previousTraits =
        queryClient.getQueryData<TraitGroups>(TRAITS_QUERY_KEY);
      const baseTraits = previousTraits ?? traitValues;

      queryClient.setQueryData<TraitGroups>(
        TRAITS_QUERY_KEY,
        addTraitToGroups(baseTraits, type, value),
      );

      return {
        previousTraits,
        type,
        value,
      };
    },
    onSuccess: (result, variables) => {
      const confirmedValue = result.created
        ? result.trait.trait_value
        : variables.value;

      queryClient.setQueryData<TraitGroups>(TRAITS_QUERY_KEY, (current) => {
        const currentGroups = current ?? traitValues;
        const reconciledGroups =
          result.created && confirmedValue !== variables.value
            ? removeTraitFromGroups(
                currentGroups,
                variables.type,
                variables.value,
              )
            : currentGroups;

        return addTraitToGroups(
          reconciledGroups,
          variables.type,
          confirmedValue,
        );
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTraits) {
        queryClient.setQueryData<TraitGroups>(
          TRAITS_QUERY_KEY,
          context.previousTraits,
        );
        return;
      }

      queryClient.setQueryData<TraitGroups>(TRAITS_QUERY_KEY, (current) =>
        removeTraitFromGroups(
          current ?? EMPTY_TRAITS,
          context?.type ?? _variables.type,
          context?.value ?? _variables.value,
        ),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TRAITS_QUERY_KEY });
    },
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
        return {
          value: sanitizedValue,
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

  const hasTraitData = traitsQuery.data !== undefined;
  const traitsError =
    !hasTraitData && traitsQuery.error instanceof Error
      ? normalizeTraitsErrorMessage(traitsQuery.error.message)
      : !hasTraitData && traitsQuery.isError
        ? "Failed to load traits"
        : "";

  return {
    createOrSelectTrait,
    isCreatingTrait: createTraitMutation.isPending,
    isUsingFallbackTraits: false,
    isLoadingTraits: traitsQuery.isLoading && !hasTraitData,
    traitOptions,
    traitValues,
    traitsError,
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

function normalizeTraitsErrorMessage(message: string) {
  if (/aborted|aborterror|operation was aborted/i.test(message)) {
    return "Failed to load traits";
  }

  return message;
}

function removeTraitFromGroups(
  groups: TraitGroups,
  type: TraitType,
  value: string,
): TraitGroups {
  const normalizedGroups = normalizeTraitGroups(groups);

  return {
    ...normalizedGroups,
    [type]: normalizedGroups[type].filter((traitValue) => traitValue !== value),
  };
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLocaleLowerCase().includes("application/json")) {
    throw new Error("Traits API returned a non-JSON response");
  }

  return (await response.json()) as T;
}
