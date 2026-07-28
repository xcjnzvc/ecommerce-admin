"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "./query-client";
import { RealtimeQueryInvalidation } from "./realtime-invalidation";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeQueryInvalidation />
      {children}
    </QueryClientProvider>
  );
}
