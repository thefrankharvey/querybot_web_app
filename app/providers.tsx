"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState } from "react";

import { TraitsCacheWarmer } from "@/app/components/traits/traits-cache-warmer";
import { TRAITS_QUERY_KEY } from "@/lib/traits";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: ONE_DAY_MS,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [persister] = useState(() => {
    if (typeof window === "undefined") return null;

    return createSyncStoragePersister({
      key: "querybot-traits-cache",
      storage: window.localStorage,
      throttleTime: 0,
    });
  });

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        <TraitsCacheWarmer />
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY_MS,
        buster: "traits-cache-v1",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === "success" &&
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === TRAITS_QUERY_KEY[0],
        },
      }}
    >
      <TraitsCacheWarmer />
      {children}
    </PersistQueryClientProvider>
  );
}
